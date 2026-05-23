import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const committeeBudgets: Record<string, number> = {
    "Executive Board": 2500,
    Marketing: 1200,
    Logistics: 1500,
    Finance: 800,
    Technology: 1000,
  };

  try {
    const liquidations = await db.liquidation.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            committee: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const spentPerCommittee: Record<string, number> = {};
    let totalSpent = 0;

    liquidations.forEach((liq) => {
      if (liq.status === "APPROVED") {
        const amt = Number(liq.amount);
        totalSpent += amt;
        const commName = liq.user.committee?.name || "General";
        spentPerCommittee[commName] = (spentPerCommittee[commName] || 0) + amt;
      }
    });

    const totalAllocated = Object.values(committeeBudgets).reduce(
      (a, b) => a + b,
      0
    );

    const summaries = Object.entries(committeeBudgets).map(
      ([name, allocated]) => {
        const spent = spentPerCommittee[name] || 0;
        return {
          committeeName: name,
          allocated,
          spent,
          remaining: allocated - spent,
        };
      }
    );

    const filteredLiquidations =
      session.user.role === "ADMIN"
        ? liquidations
        : liquidations.filter((liq) => liq.userId === session.user.id);

    return NextResponse.json({
      totalAllocated,
      totalSpent,
      remainingFunds: totalAllocated - totalSpent,
      committeeSummaries: summaries,
      liquidations: filteredLiquidations,
    });
  } catch (error) {
    console.error("GET FINANCE SUMMARY ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
