import { Task } from "@prisma/client";
import { Check, Circle, Clock } from "lucide-react";

type Props = {
  task: Task;
  onToggle: (taskId: string) => void;
};

export function TaskCard({ task, onToggle }: Props) {
  return (
    <div
      className={`
        group flex items-start p-4 rounded-xl bg-white border transition-all duration-200
        ${
          task.isCompleted
            ? "border-transparent opacity-50 bg-neutral-100" // Completed state
            : "border-zinc-200 shadow-sm hover:border-zinc-300 hover:shadow-md" // Active state
        }
      `}
    >
      <button
        onClick={() => onToggle(task.id)}
        className="mt-0.5 flex-shrink-0 text-zinc-400 hover:text-zinc-900 transition-colors focus:outline-none"
      >
        {task.isCompleted ? (
          <div className="bg-zinc-900 text-white rounded-full p-0.5 animate-in zoom-in-50 duration-200">
            <Check size={16} strokeWidth={3} />
          </div>
        ) : (
          <Circle
            size={20}
            className="text-zinc-300 group-hover:text-zinc-400"
            strokeWidth={2}
          />
        )}
      </button>

      <div
        className="ml-4 flex-grow cursor-pointer"
        onClick={() => onToggle(task.id)}
      >
        <p
          className={`text-base font-medium leading-relaxed transition-all duration-300 ${
            task.isCompleted
              ? "text-zinc-500 line-through decoration-zinc-300"
              : "text-zinc-900"
          }`}
        >
          {task.title}
        </p>
        <div className="mt-1 flex items-center text-xs text-zinc-400">
          {task.durationMinutes > 0 ? (
            <span className="flex items-center bg-zinc-50 px-2 py-0.5 rounded text-zinc-500 font-medium">
              <Clock size={12} className="mr-1" />
              {task.durationMinutes} min
            </span>
          ) : (
            <span className="text-zinc-300">-- min</span>
          )}
        </div>
      </div>
    </div>
  );
}
