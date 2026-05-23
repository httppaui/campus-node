import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { TaskStatus, TaskPriority } from "@prisma/client";

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  assigneeId: z.string().optional().nullable(),
  deliverable: z.string().optional().nullable(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Missing task ID" }, { status: 400 });
  }

  try {
    const currentTask = await db.task.findUnique({
      where: { id },
    });

    if (!currentTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // RBAC Check: Admin, Officer, or Assignee
    const isAssignee = currentTask.assigneeId === session.user.id;
    const isOfficerOrAdmin = ["ADMIN", "OFFICER"].includes(session.user.role);

    if (!isAssignee && !isOfficerOrAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const result = updateTaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Strict boundary: Only Officer/Admin can change title, assignee, priority, dueDate, or description
    if (!isOfficerOrAdmin) {
      if (
        data.title !== undefined ||
        data.description !== undefined ||
        data.priority !== undefined ||
        data.dueDate !== undefined ||
        data.assigneeId !== undefined
      ) {
        return NextResponse.json(
          { error: "Forbidden: Assignees can only update status and deliverables" },
          { status: 403 }
        );
      }
    }

    const updatedTask = await db.$transaction(async (tx) => {
      const task = await tx.task.update({
        where: { id },
        data: {
          ...(data.title !== undefined ? { title: data.title } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.status !== undefined ? { status: data.status } : {}),
          ...(data.priority !== undefined ? { priority: data.priority } : {}),
          ...(data.dueDate !== undefined ? { dueDate: data.dueDate } : {}),
          ...(data.assigneeId !== undefined ? { assigneeId: data.assigneeId } : {}),
          ...(data.deliverable !== undefined ? { deliverable: data.deliverable } : {}),
        },
      });

      // If task transitioned to DONE and assignee is defined, award +15 points
      if (
        task.status === TaskStatus.DONE &&
        currentTask.status !== TaskStatus.DONE &&
        task.assigneeId
      ) {
        const reason = `Completed task: ${task.title}`;
        const existingTx = await tx.pointTransaction.findFirst({
          where: { userId: task.assigneeId, reason },
        });

        if (!existingTx) {
          await tx.pointTransaction.create({
            data: {
              userId: task.assigneeId,
              points: 15,
              reason,
              approvedById: session.user.id,
            },
          });

          await tx.user.update({
            where: { id: task.assigneeId },
            data: { totalPoints: { increment: 15 } },
          });
        }
      }

      return task;
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("PATCH TASK ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
