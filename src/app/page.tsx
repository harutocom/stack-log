import { prisma } from "@/lib/prisma";
import { Clock, MoreHorizontal, Moon, LogOut, Calendar } from "lucide-react";
import { TasksView } from "@/components/TasksView";
import { getCurrentUser } from "@/lib/auth-helper";
import { signOut } from "@/auth";

export const dynamic = "force-dynamic"; // Prevent caching for dev

export default async function Home() {
  const userId = await getCurrentUser();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch data directly from DB
  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Fetch Weekly Goal
  const weeklyGoal = await prisma.weeklyGoal.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const weeklyGoalTitle = weeklyGoal?.title || "No Active Goal";

  return (
    <div className="min-h-screen bg-neutral-50 text-zinc-900 pb-24 font-sans selection:bg-black selection:text-white">
      {/* Header Area */}
      <header className="px-6 pt-12 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Today</h1>
          <div className="flex items-center space-x-2">
            <a
              href="/night"
              className="p-2 text-zinc-400 hover:text-indigo-900 transition-colors"
              title="Night Reflection"
            >
              <Moon size={24} />
            </a>
            <a
              href="/history"
              className="p-2 text-zinc-400 hover:text-indigo-900 transition-colors"
              title="History"
            >
              <Calendar size={24} />
            </a>
            <a
              href="/goals"
              className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600 transition-colors"
              title="Manage Goals"
            >
              <MoreHorizontal size={24} />
            </a>
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button
                type="submit"
                className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                title="Sign Out"
              >
                <LogOut size={24} />
              </button>
            </form>
          </div>
        </div>

        {/* Weekly Goal Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-zinc-900" />
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Weekly Goal
          </p>
          <h2 className="text-lg font-bold leading-snug text-zinc-900">
            {weeklyGoalTitle}
          </h2>
          <div className="mt-4 flex items-center text-xs font-medium text-zinc-500">
            <span className="flex items-center">
              <Clock size={14} className="mr-1.5" />
              Day 4 / 7
            </span>
          </div>
        </div>
      </header>

      {/* Task List (Client Component with Optimistic Updates) */}
      <TasksView initialTasks={tasks} weeklyGoalTitle={weeklyGoalTitle} />

      {/* Bottom Blur Fade for style */}
      <div className="fixed bottom-0 left-0 w-full h-12 bg-gradient-to-t from-neutral-50 to-transparent pointer-events-none" />
    </div>
  );
}
