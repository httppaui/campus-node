import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { DocCategory } from "@prisma/client";

const documentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Valid URL is required"),
  category: z.nativeEnum(DocCategory).default(DocCategory.SOP),
  tags: z.array(z.string()).default([]),
  committeeId: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const committeeId = searchParams.get("committeeId");

  try {
    const docs = await db.document.findMany({
      where: {
        AND: [
          category ? { category: category as DocCategory } : {},
          committeeId ? { committeeId } : {},
        ],
      },
      include: {
        uploader: {
          select: {
            name: true,
          },
        },
        committee: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(docs);
  } catch (error) {
    console.error("GET DOCUMENTS ERROR:", error);
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

  const isOfficerOrAdmin = ["ADMIN", "OFFICER"].includes(session.user.role);
  if (!isOfficerOrAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = documentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, url, category, tags, committeeId } = result.data;

    const doc = await db.document.create({
      data: {
        title,
        url,
        category,
        tags,
        committeeId: committeeId || null,
        uploaderId: session.user.id,
      },
    });

    return NextResponse.json(doc);
  } catch (error) {
    console.error("POST DOCUMENT ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
