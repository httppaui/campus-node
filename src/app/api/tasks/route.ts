import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { TaskStatus, TaskPriority } from "@prisma/client";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  dueDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  committeeId: z.string().min(1, "Committee ID is required"),
  assigneeId: z.string().optional().nullable(),
});

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

  try {
    const tasks = await db.task.findMany({
      where: committeeId ? { committeeId } : {},
      include: {
        committee: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET TASKS ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "OFFICER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = createTaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, description, priority, dueDate, committeeId, assigneeId } =
      result.data;

    const task = await db.task.create({
      data: {
        title,
        description,
        priority,
        dueDate,
        committeeId,
        assigneeId: assigneeId || null,
        creatorId: session.user.id,
        status: TaskStatus.TODO,
      },
      include: {
        assignee: { select: { id: true, name: true } },
        committee: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("POST TASK ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
