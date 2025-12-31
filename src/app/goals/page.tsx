import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import GoalEditor from "@/components/GoalEditor";
import { updateMonthlyGoal, updateWeeklyGoal } from "@/app/actions";

const FIXED_USER_ID = "user-001";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  // Fetch latest goals
  // In a real app we might rely on the hierarchy properly or 'isActive' flags.
  // Using direct latest query for simplicity as per requirements for MVP.

  const monthlyGoal = await prisma.monthlyGoal.findFirst({
    where: { userId: FIXED_USER_ID },
    orderBy: { createdAt: "desc" },
  });

  const weeklyGoal = await prisma.weeklyGoal.findFirst({
    where: { userId: FIXED_USER_ID },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-neutral-50 text-zinc-900 p-6 font-sans">
      <header className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-zinc-500 hover:text-zinc-900 transition-colors mb-4 text-sm font-medium"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Home
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Manage Goals</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Review and update your current focus.
        </p>
      </header>

      <main className="max-w-md mx-auto space-y-6">
        <section>
          {!monthlyGoal ? (
            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm">
              No Monthly Goal found. Please check seeding.
            </div>
          ) : (
            <GoalEditor
              goalId={monthlyGoal.id}
              initialTitle={monthlyGoal.title}
              type="monthly"
              onSave={updateMonthlyGoal}
            />
          )}
        </section>

        <div className="flex justify-center">
          <div className="w-px h-8 bg-zinc-200" />
        </div>

        <section>
          {!weeklyGoal ? (
            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm">
              No Weekly Goal found. Please check seeding.
            </div>
          ) : (
            <GoalEditor
              goalId={weeklyGoal.id}
              initialTitle={weeklyGoal.title}
              type="weekly"
              onSave={updateWeeklyGoal}
            />
          )}
        </section>

        <div className="mt-12 text-center">
          <Link
            href="/morning"
            className="text-sm text-indigo-600 hover:underline"
          >
            Go to Morning Check
          </Link>
        </div>
      </main>
    </div>
  );
}
