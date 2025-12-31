"use client";

import { useState, useOptimistic, startTransition } from "react";
import { Task } from "@prisma/client";
import { Plus, MoreHorizontal } from "lucide-react";
import { TaskCard } from "@/components/TaskCard";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { toggleTask, addTask } from "@/app/actions";

type Props = {
  initialTasks: Task[];
  weeklyGoalTitle: string;
};

export function TasksView({ initialTasks, weeklyGoalTitle }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Optimistic UI for immediate feedback
  const [optimisticTasks, addOptimisticTask] = useOptimistic(
    initialTasks,
    (state, updatedTask: Task) => {
      // Handle Toggle
      const existing = state.find((t) => t.id === updatedTask.id);
      if (existing) {
        return state.map((t) =>
          t.id === updatedTask.id ? { ...t, isCompleted: !t.isCompleted } : t
        );
      }
      // Handle Add
      return [updatedTask, ...state];
    }
  );

  const handleToggle = async (taskId: string) => {
    const task = optimisticTasks.find((t) => t.id === taskId);
    if (!task) return;

    // Optimistically toggle
    startTransition(() => {
      addOptimisticTask({ ...task });
    });

    // Server Action
    await toggleTask(taskId);
  };

  const handleAdd = async (title: string, durationMinutes: number) => {
    // Generate temp task for optimism
    const tempTask: Task = {
      id: Math.random().toString(),
      title,
      durationMinutes,
      isCompleted: false,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: "temp",
      weeklyGoalId: "temp",
    };

    startTransition(() => {
      addOptimisticTask(tempTask);
    });
    await addTask(title, durationMinutes);
    setIsDialogOpen(false);
  };

  const remainingTasksCount = optimisticTasks.filter(
    (t) => !t.isCompleted
  ).length;

  return (
    <>
      <main className="px-6 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 ml-1">
          Tasks ({remainingTasksCount} remaining)
        </h3>

        <div className="space-y-3">
          {optimisticTasks.map((task) => (
            <TaskCard key={task.id} task={task} onToggle={handleToggle} />
          ))}
        </div>
      </main>

      {/* FAB (Floating Action Button) */}
      <div className="fixed bottom-8 right-6 z-40">
        <button
          onClick={() => setIsDialogOpen(true)}
          className="bg-zinc-900 hover:bg-zinc-800 text-white p-4 rounded-full shadow-lg shadow-zinc-300/50 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>

      {/* Add Task Dialog */}
      <AddTaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAdd={handleAdd}
      />
    </>
  );
}
