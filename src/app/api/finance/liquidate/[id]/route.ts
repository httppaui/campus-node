import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { LiquidationStatus } from "@prisma/client";

const reviewSchema = z.object({
  status: z.nativeEnum(LiquidationStatus),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json(
      { error: "Missing liquidation ID" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const result = reviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { status } = result.data;

    const liquidation = await db.liquidation.update({
      where: { id },
      data: {
        status,
        reviewedById: session.user.id,
      },
    });

    return NextResponse.json(liquidation);
  } catch (error) {
    console.error("PATCH LIQUIDATE ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
