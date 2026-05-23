import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const applicationSchema = z.object({
  formResponse: z.record(z.any()),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isOfficerOrAdmin = ["ADMIN", "OFFICER"].includes(session.user.role);
  if (!isOfficerOrAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const apps = await db.application.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            course: true,
            yearLevel: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(apps);
  } catch (error) {
    console.error("GET APPLICATIONS ERROR:", error);
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

  try {
    const body = await req.json();
    const result = applicationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { formResponse } = result.data;

    // Check if user already has an application
    const existingApp = await db.application.findFirst({
      where: { userId: session.user.id },
    });

    if (existingApp) {
      return NextResponse.json(
        { error: "You have already submitted an application." },
        { status: 400 }
      );
    }

    const app = await db.application.create({
      data: {
        userId: session.user.id,
        formResponse,
        status: "APPLIED",
      },
    });

    return NextResponse.json(app);
  } catch (error) {
    console.error("POST APPLICATION ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
