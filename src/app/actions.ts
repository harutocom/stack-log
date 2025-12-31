"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const FIXED_USER_ID = "user-001";
const FIXED_WEEKLY_GOAL_ID = "weekly-001";

export async function toggleTask(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) return;

  await prisma.task.update({
    where: { id: taskId },
    data: { isCompleted: !task.isCompleted },
  });

  revalidatePath("/");
}

export async function addTask(title: string, durationMinutes: number) {
  await prisma.task.create({
    data: {
      userId: FIXED_USER_ID,
      weeklyGoalId: FIXED_WEEKLY_GOAL_ID,
      title,
      durationMinutes,
      date: new Date(),
      isCompleted: false,
    },
  });

  revalidatePath("/");
}

export async function startDay(
  yesterdayTaskIdsToReschedule: string[],
  newTasks: { title: string; duration: number }[]
) {
  const today = new Date();

  // 1. Reschedule selected yesterday's tasks to today
  if (yesterdayTaskIdsToReschedule.length > 0) {
    await prisma.task.updateMany({
      where: {
        id: { in: yesterdayTaskIdsToReschedule },
      },
      data: {
        date: today,
      },
    });
  }

  // 2. Create new tasks for today
  if (newTasks.length > 0) {
    await prisma.task.createMany({
      data: newTasks.map((t) => ({
        userId: FIXED_USER_ID,
        weeklyGoalId: FIXED_WEEKLY_GOAL_ID,
        title: t.title,
        durationMinutes: t.duration,
        date: today,
        isCompleted: false,
      })),
    });
  }

  revalidatePath("/");
  revalidatePath("/morning");
}

export async function completeDay(journal: string, achievementRate: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day for unique constraint

  // Recalculate achievementRate server-side for consistency
  const tasks = await prisma.task.findMany({
    where: {
      userId: FIXED_USER_ID,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
      // Note: In a real app we might want to handle timezone offsets carefully.
      // Here we assume server time matches user expectation for "today".
    },
  });

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;
  // Use calculated rate if tasks exist, otherwise 0.
  // We can also allow the client passed rate if we trust it, but recalculating is safer.
  // However, if the user completed tasks on the client and didn't sync yet (optimistic UI?),
  // server might be behind?
  // But our app seems to sync on 'toggle'. So server state is accurate.
  const calculatedRate =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  await prisma.dailyLog.upsert({
    where: {
      date: today,
    },
    update: {
      achievementRate: calculatedRate,
      journal,
      commitTime: new Date(),
    },
    create: {
      userId: FIXED_USER_ID,
      date: today,
      achievementRate: calculatedRate,
      journal,
      commitTime: new Date(),
    },
  });

  redirect("/sleeping");
}
