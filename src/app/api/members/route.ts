import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowedRoles = ["ADMIN", "OFFICER", "MEMBER", "ALUMNI"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const committeeId = searchParams.get("committeeId");
  const search = searchParams.get("search");

  try {
    const members = await db.user.findMany({
      where: {
        AND: [
          committeeId ? { committeeId } : {},
          search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        yearLevel: true,
        course: true,
        isActive: true,
        totalPoints: true,
        committee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("GET MEMBERS ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
