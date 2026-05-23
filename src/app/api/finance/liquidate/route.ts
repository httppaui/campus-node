import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const createLiquidationSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  receiptUrl: z.string().url("Valid receipt URL is required"),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = createLiquidationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { amount, description, receiptUrl } = result.data;

    const liquidation = await db.liquidation.create({
      data: {
        userId: session.user.id,
        amount,
        description,
        receiptUrl,
        status: "PENDING",
      },
    });

    return NextResponse.json(liquidation);
  } catch (error) {
    console.error("POST LIQUIDATE ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
