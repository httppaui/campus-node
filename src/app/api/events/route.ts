import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  location: z.string().min(1, "Location is required"),
  startTime: z.string().transform((val) => new Date(val)),
  endTime: z.string().transform((val) => new Date(val)),
  pointsValue: z.number().int().nonnegative().default(10),
  coverImage: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const events = await db.event.findMany({
      include: {
        registrations: {
          select: {
            userId: true,
            rsvpStatus: true,
            volunteerRole: true,
          },
        },
        attendances: {
          select: {
            userId: true,
            checkInTime: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("GET EVENTS ERROR:", error);
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
    const result = createEventSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      location,
      startTime,
      endTime,
      pointsValue,
      coverImage,
    } = result.data;

    // Generate random secret to seed HMAC rotation
    const qrSecret = crypto.randomUUID();

    const event = await db.event.create({
      data: {
        title,
        description,
        location,
        startTime,
        endTime,
        pointsValue,
        coverImage,
        qrSecret,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("POST EVENT ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
