import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const awardPointsSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  points: z.number().int().nonnegative("Points must be non-negative"),
  reason: z.string().min(1, "Reason is required"),
});

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
    const result = awardPointsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { userId, points, reason } = result.data;

    // Verify target user exists
    const targetUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Process inside transaction
    const transaction = await db.$transaction(async (tx) => {
      const pt = await tx.pointTransaction.create({
        data: {
          userId,
          points,
          reason,
          approvedById: session.user.id,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          totalPoints: { increment: points },
        },
      });

      return pt;
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("POST AWARD POINTS ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
