import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const manualSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isOfficerOrAdmin = ["ADMIN", "OFFICER"].includes(session.user.role);
  if (!isOfficerOrAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: eventId } = params;

  try {
    const body = await req.json();
    const result = manualSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid manual check-in payload" },
        { status: 400 }
      );
    }

    const { userId } = result.data;

    // Fetch the event
    const event = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Process attendance inside database transaction
    const attendance = await db.$transaction(async (tx) => {
      // Check if already checked in
      const existingAttendance = await tx.attendance.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId,
          },
        },
      });

      if (existingAttendance) {
        return existingAttendance; // Already checked in
      }

      // Create manual attendance record
      const att = await tx.attendance.create({
        data: {
          eventId,
          userId,
          isManual: true,
          verifiedById: session.user.id,
        },
      });

      // Award points
      const pointsToAward = event.pointsValue;
      const reason = `Attended event: ${event.title} (Manual Override)`;

      await tx.pointTransaction.create({
        data: {
          userId,
          points: pointsToAward,
          reason,
          approvedById: session.user.id,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          totalPoints: { increment: pointsToAward },
        },
      });

      return att;
    });

    return NextResponse.json({ success: true, attendance });
  } catch (error) {
    console.error("POST MANUAL ATTENDANCE ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
