import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function GET(
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

  const { id } = params;

  try {
    const event = await db.event.findUnique({
      where: { id },
      select: { qrSecret: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const secret =
      process.env.NEXTAUTH_SECRET || "default_development_secret_32_chars";
    const timeSlice = Math.floor(Date.now() / 15000);

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${event.qrSecret}${timeSlice}`);
    const token = hmac.digest("hex");

    const secondsRemaining = 15 - (Math.floor(Date.now() / 1000) % 15);

    return NextResponse.json({ token, secondsRemaining, timeSlice });
  } catch (error) {
    console.error("GET EVENT QR ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
