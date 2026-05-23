import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { ApplicationStatus, Role } from "@prisma/client";

const reviewSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
  reviewNotes: z.string().optional().nullable(),
});

export async function PATCH(
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
  if (!id) {
    return NextResponse.json(
      { error: "Missing application ID" },
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

    const { status, reviewNotes } = result.data;

    // Use a transaction to update application status and (if offered) update user role to MEMBER
    const updatedApp = await db.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id },
        data: {
          status,
          ...(reviewNotes !== undefined ? { reviewNotes } : {}),
        },
      });

      if (status === "OFFERED") {
        await tx.user.update({
          where: { id: app.userId },
          data: {
            role: Role.MEMBER,
          },
        });
      }

      return app;
    });

    return NextResponse.json(updatedApp);
  } catch (error) {
    console.error("PATCH APPLICATION ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
