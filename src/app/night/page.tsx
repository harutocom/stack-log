import { prisma } from "@/lib/prisma";
import NightReflectionClient from "@/components/NightReflectionClient";
import { getCurrentUser } from "@/lib/auth-helper";

export const dynamic = "force-dynamic";

export default async function NightReflectionPage() {
  const userId = await getCurrentUser();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
  });

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;
  const progress =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <NightReflectionClient
      completedCount={completedCount}
      totalCount={totalCount}
      progress={progress}
    />
  );
}
