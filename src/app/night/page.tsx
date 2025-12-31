import { prisma } from "@/lib/prisma";
import NightReflectionClient from "@/components/NightReflectionClient";

const FIXED_USER_ID = "user-001";

export const dynamic = "force-dynamic";

export default async function NightReflectionPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tasks = await prisma.task.findMany({
    where: {
      userId: FIXED_USER_ID,
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
