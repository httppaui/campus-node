import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const rsvpSchema = z.object({
  rsvpStatus: z.boolean().default(true),
  volunteerRole: z.string().optional().nullable(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = params;
  if (!eventId) {
    return NextResponse.json({ error: "Missing event ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const result = rsvpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { rsvpStatus, volunteerRole } = result.data;

    // Check if event exists
    const event = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const registration = await db.eventRegistration.upsert({
      where: {
        eventId_userId: {
          eventId,
          userId: session.user.id,
        },
      },
      update: {
        rsvpStatus,
        volunteerRole,
      },
      create: {
        eventId,
        userId: session.user.id,
        rsvpStatus,
        volunteerRole,
      },
    });

    return NextResponse.json(registration);
  } catch (error) {
    console.error("POST RSVP ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
