import { prisma } from "@/lib/prisma";
import MorningCheckWizard from "@/components/MorningCheckWizard";
import { getCurrentUser } from "@/lib/auth-helper";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MorningCheckPage() {
  const userId = await getCurrentUser();
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  // 1. Fetch Past unfinished tasks (yesterday and before)
  const pastTasks = await prisma.task.findMany({
    where: {
      userId,
      isCompleted: false,
      date: {
        lt: today,
      },
    },
  });

  // 2. Fetch Current Weekly Goal
  const weeklyGoal = await prisma.weeklyGoal.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Fallback if no goal found
  if (!weeklyGoal) {
    // For MVP, if no goal, maybe redirect to goals or show message
    // return <div>Please create a weekly goal first.</div>;
    // Or just pass null if wizard handles it, but wizard props say WeeklyGoal.
    // Let's redirect to /goals if no goal?
    redirect("/goals");
  }

  return <MorningCheckWizard pastTasks={pastTasks} weeklyGoal={weeklyGoal} />;
}
