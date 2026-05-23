import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import { z } from "zod";

const checkInSchema = z.object({
  token: z.string().min(1, "Token is required"),
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

  try {
    const body = await req.json();
    const result = checkInSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid token payload" },
        { status: 400 }
      );
    }

    const { token: scannedToken } = result.data;

    // Fetch the event
    const event = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Verify token
    const secret =
      process.env.NEXTAUTH_SECRET || "default_development_secret_32_chars";
    const timeSlice = Math.floor(Date.now() / 15000);

    const getHmac = (slice: number) => {
      const hmac = crypto.createHmac("sha256", secret);
      hmac.update(`${event.qrSecret}${slice}`);
      return hmac.digest("hex");
    };

    const tokenForCurrent = getHmac(timeSlice);
    const tokenForPrev = getHmac(timeSlice - 1);

    if (scannedToken !== tokenForCurrent && scannedToken !== tokenForPrev) {
      return NextResponse.json(
        { error: "Expired or invalid QR code. Please scan again." },
        { status: 400 }
      );
    }

    // Process attendance inside database transaction
    const attendance = await db.$transaction(async (tx) => {
      // Check if already checked in
      const existingAttendance = await tx.attendance.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId: session.user.id,
          },
        },
      });

      if (existingAttendance) {
        return existingAttendance; // Already checked in
      }

      // Create attendance
      const att = await tx.attendance.create({
        data: {
          eventId,
          userId: session.user.id,
          isManual: false,
        },
      });

      // Award points
      const pointsToAward = event.pointsValue;
      const reason = `Attended event: ${event.title}`;

      await tx.pointTransaction.create({
        data: {
          userId: session.user.id,
          points: pointsToAward,
          reason,
        },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: {
          totalPoints: { increment: pointsToAward },
        },
      });

      return att;
    });

    return NextResponse.json({ success: true, attendance });
  } catch (error) {
    console.error("POST CHECK-IN ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
