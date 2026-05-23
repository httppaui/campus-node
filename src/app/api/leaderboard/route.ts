import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const leaderboard = await db.user.findMany({
      where: {
        role: { in: ["ADMIN", "OFFICER", "MEMBER"] },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        totalPoints: true,
        image: true,
        committee: {
          select: {
            name: true,
          },
        },
        badges: {
          select: {
            badge: {
              select: {
                name: true,
                iconUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        totalPoints: "desc",
      },
      take: 50,
    });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("GET LEADERBOARD ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
