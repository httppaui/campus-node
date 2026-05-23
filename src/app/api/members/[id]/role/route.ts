import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

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
    return NextResponse.json({ error: "Missing member ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { role, isActive, committeeId } = body;

    // Validate role if provided
    if (role && !Object.values(Role).includes(role as Role)) {
      return NextResponse.json({ error: "Invalid role value" }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        ...(role ? { role: role as Role } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(committeeId !== undefined ? { committeeId } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        committeeId: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PATCH MEMBER ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
