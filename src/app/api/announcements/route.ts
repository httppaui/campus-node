import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  isPinned: z.boolean().default(false),
  isAlumniTarget: z.boolean().default(false),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Alumni see announcements with isAlumniTarget = true OR general announcements
    // Members see announcements with isAlumniTarget = false
    const isAlumni = session.user.role === "ALUMNI";

    const announcements = await db.announcement.findMany({
      where: isAlumni
        ? {
            OR: [{ isAlumniTarget: true }, { isAlumniTarget: false }],
          }
        : {
            isAlumniTarget: false,
          },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("GET ANNOUNCEMENTS ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = announcementSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, content, isPinned, isAlumniTarget } = result.data;

    const announcement = await db.announcement.create({
      data: {
        title,
        content,
        isPinned,
        isAlumniTarget,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("POST ANNOUNCEMENT ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
