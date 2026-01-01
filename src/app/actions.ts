"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helper";

// FIXED_WEEKLY_GOAL_ID should also be dynamic or fetched.
// For MVP transition, we might still need to assume a goal exists or fetch it.
// Let's remove FIXED_USER_ID.
// For goal, we will fetch the latest active weekly goal for the user.

async function getActiveWeeklyGoalId(userId: string) {
  const goal = await prisma.weeklyGoal.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" }, // Simple logic for MVP
  });
  return goal?.id;
}

export async function toggleTask(taskId: string) {
  const userId = await getCurrentUser();
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task || task.userId !== userId) return;

  await prisma.task.update({
    where: { id: taskId },
    data: { isCompleted: !task.isCompleted },
  });

  revalidatePath("/");
}

export async function addTask(title: string, durationMinutes: number) {
  const userId = await getCurrentUser();
  const weeklyGoalId = await getActiveWeeklyGoalId(userId);

  if (!weeklyGoalId) {
    // Handle case where no goal exists - maybe create a default or error
    // For now, let's just error or requires goal.
    // Ideally we should create one if missing, or just fail.
    // Let's create a dummy one if missing for smoothness, or just error.
    // Given instructions, "user-001" had it. New users won't.
    // I'll throw if no goal, prompting user to create one?
    // Or just nullable? Schema says WeeklyGoalId is required.
    // I will assume one exists or just return for now to avoid crashing,
    // but better to fix Seed or UI flow.
    // Converting to "No Goal" handling is big.
    // Let's try to fetch, if fail, maybe throw.
    throw new Error("No weekly goal found. Please create one.");
  }

  await prisma.task.create({
    data: {
      userId,
      weeklyGoalId,
      title,
      durationMinutes,
      date: new Date(),
      isCompleted: false,
    },
  });

  revalidatePath("/");
}

export async function startDay(
  carryOverTaskIds: string[],
  newTasks: { title: string; duration: number }[]
) {
  const userId = await getCurrentUser();
  const today = new Date();

  // 1. Carry over selected past tasks to today
  if (carryOverTaskIds.length > 0) {
    await prisma.task.updateMany({
      where: {
        id: { in: carryOverTaskIds },
      },
      data: {
        date: today,
      },
    });
  }

  // 2. Create new tasks for today
  if (newTasks.length > 0) {
    const userId = await getCurrentUser();
    const weeklyGoalId = await getActiveWeeklyGoalId(userId);

    if (!weeklyGoalId) throw new Error("No weekly goal found");

    await prisma.task.createMany({
      data: newTasks.map((t) => ({
        userId,
        weeklyGoalId,
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
  const userId = await getCurrentUser();
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day for unique constraint

  // Recalculate achievementRate server-side for consistency
  const tasks = await prisma.task.findMany({
    where: {
      userId,
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
      userId,
      date: today,
      achievementRate: calculatedRate,
      journal,
      commitTime: new Date(),
    },
  });

  redirect("/sleeping");
}

export async function updateMonthlyGoal(goalId: string, title: string) {
  const userId = await getCurrentUser();
  // Verify ownership
  const count = await prisma.monthlyGoal.count({
    where: { id: goalId, userId },
  });
  if (count === 0) return; // Or throw

  await prisma.monthlyGoal.update({
    where: { id: goalId },
    data: { title },
  });
  revalidatePath("/goals");
  revalidatePath("/");
}

export async function updateWeeklyGoal(goalId: string, title: string) {
  const userId = await getCurrentUser();
  // Verify ownership
  const count = await prisma.weeklyGoal.count({
    where: { id: goalId, userId },
  });
  if (count === 0) return;

  await prisma.weeklyGoal.update({
    where: { id: goalId },
    data: { title },
  });
  revalidatePath("/goals");
  revalidatePath("/");
}

// Helper to ensure Season exists
async function ensureSeasonGoal(userId: string, date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const quarter = Math.floor(month / 3) + 1;
  const seasonTitle = `Season Q${quarter} ${year}`;

  // Start/End of quarter
  const startMonth = (quarter - 1) * 3;
  const startDate = new Date(year, startMonth, 1);
  const endDate = new Date(year, startMonth + 3, 0, 23, 59, 59);

  let season = await prisma.seasonGoal.findFirst({
    where: {
      userId,
      startDate: { lte: date },
      endDate: { gte: date },
    },
  });

  if (!season) {
    season = await prisma.seasonGoal.create({
      data: {
        userId,
        title: seasonTitle,
        startDate,
        endDate,
        isActive: true,
      },
    });
  }
  return season;
}

export async function createMonthlyGoal(title: string) {
  const userId = await getCurrentUser();
  const today = new Date();

  const season = await ensureSeasonGoal(userId, today);

  await prisma.monthlyGoal.create({
    data: {
      userId,
      title,
      seasonGoalId: season.id,
      month: today.getMonth() + 1,
      year: today.getFullYear(),
    },
  });
  revalidatePath("/goals");
  revalidatePath("/");
}

async function ensureMonthlyGoal(userId: string, date: Date) {
  let monthly = await prisma.monthlyGoal.findFirst({
    where: {
      userId,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    },
  });

  if (!monthly) {
    const season = await ensureSeasonGoal(userId, date);
    monthly = await prisma.monthlyGoal.create({
      data: {
        userId,
        title: "Monthly Goal", // Placeholder
        seasonGoalId: season.id,
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      },
    });
  }
  return monthly;
}

export async function createWeeklyGoal(title: string) {
  const userId = await getCurrentUser();
  const today = new Date();

  const monthly = await ensureMonthlyGoal(userId, today);

  // Calculate week info
  // Current logic: just days range?
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (6 - today.getDay())); // Saturday

  // Approximate week number in month
  const weekNum = Math.ceil(today.getDate() / 7);

  await prisma.weeklyGoal.create({
    data: {
      userId,
      title,
      monthlyGoalId: monthly.id,
      weekNumber: weekNum,
      startDate: startOfWeek,
      endDate: endOfWeek,
    },
  });
  revalidatePath("/goals");
  revalidatePath("/");
}

export async function getMonthlyHistory(year: number, month: number) {
  const userId = await getCurrentUser();

  // Calculate start and end of the month
  // Month is 1-indexed in UI, but Date uses 0-indexed for constructor if we use (year, monthIndex).
  const startDate = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const logs = await prisma.dailyLog.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endOfMonth,
      },
    },
    select: {
      date: true,
      achievementRate: true,
      journal: true,
    },
  });

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endOfMonth,
      },
      isCompleted: true, // Only fetch completed tasks for history
    },
    select: {
      id: true,
      title: true,
      date: true,
    },
  });

  // Organize by date string "YYYY-MM-DD" for easy frontend lookup
  const historyData: Record<
    string,
    {
      log?: { achievementRate: number; journal: string | null };
      tasks: { id: string; title: string }[];
    }
  > = {};

  const toKey = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  logs.forEach((log) => {
    const key = toKey(log.date);
    if (!historyData[key]) historyData[key] = { tasks: [] };
    historyData[key].log = {
      achievementRate: log.achievementRate,
      journal: log.journal,
    };
  });

  tasks.forEach((task) => {
    const key = toKey(task.date);
    if (!historyData[key]) historyData[key] = { tasks: [] };
    historyData[key].tasks.push({ id: task.id, title: task.title });
  });

  return historyData;
}
