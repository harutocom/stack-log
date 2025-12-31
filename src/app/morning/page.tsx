import { prisma } from "@/lib/prisma";
import MorningCheckWizard from "@/components/MorningCheckWizard";

const FIXED_USER_ID = "user-001";
const FIXED_WEEKLY_GOAL_ID = "weekly-001";

export const dynamic = "force-dynamic";

export default async function MorningCheckPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  // 1. Fetch Past unfinished tasks (yesterday and before)
  const pastTasks = await prisma.task.findMany({
    where: {
      userId: FIXED_USER_ID,
      isCompleted: false,
      date: {
        lt: today,
      },
    },
  });

  // 2. Fetch Current Weekly Goal
  const weeklyGoal = await prisma.weeklyGoal.findUnique({
    where: { id: FIXED_WEEKLY_GOAL_ID },
  });

  // Fallback if no goal found (though seed ensures it exists)
  if (!weeklyGoal) {
    return <div>Error: Weekly Goal not found. Please run seed.</div>;
  }

  return <MorningCheckWizard pastTasks={pastTasks} weeklyGoal={weeklyGoal} />;
}
