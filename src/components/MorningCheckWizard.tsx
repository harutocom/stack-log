"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  X,
  Calendar,
  Plus,
  Sunrise,
  ArrowLeft,
} from "lucide-react";
import { Task, WeeklyGoal } from "@prisma/client";
import { startDay } from "@/app/actions";

type Props = {
  pastTasks: Task[];
  weeklyGoal: WeeklyGoal;
};

export default function MorningCheckWizard({ pastTasks, weeklyGoal }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPastTasks, setSelectedPastTasks] = useState<string[]>([]);
  const [todaysTasks, setTodaysTasks] = useState<
    { id: string; title: string; duration: number }[]
  >([]);
  const [newTaskInput, setNewTaskInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 Logic
  const togglePastTask = (id: string) => {
    setSelectedPastTasks((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  // Step 2 Logic
  const addTodaysTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    setTodaysTasks([
      ...todaysTasks,
      { id: Math.random().toString(), title: newTaskInput, duration: 30 },
    ]);
    setNewTaskInput("");
  };

  const removeTodaysTask = (id: string) => {
    setTodaysTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Render Helpers
  const nextStep = () =>
    setStep((prev) => (prev < 3 ? ((prev + 1) as any) : prev));
  const prevStep = () =>
    setStep((prev) => (prev > 1 ? ((prev - 1) as any) : prev));

  const handleFinish = async () => {
    setIsSubmitting(true);
    await startDay(
      selectedPastTasks, // carryOverTaskIds
      todaysTasks.map((t) => ({ title: t.title, duration: t.duration }))
    );
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 text-zinc-900 font-sans">
      <div className="max-w-md w-full">
        {/* Progress Indicator */}
        <div className="flex justify-center mb-12 space-x-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? "w-8 bg-zinc-900" : "w-2 bg-zinc-200"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Past Tasks Review */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="text-center mb-8">
              <span className="inline-block p-3 bg-orange-100 text-orange-600 rounded-full mb-4">
                <Calendar size={24} />
              </span>
              <h1 className="text-2xl font-bold mb-2">Unfinished Tasks</h1>
              <p className="text-zinc-500">
                Carry these past tasks over to today?
              </p>
            </div>

            <div className="space-y-3 mb-8">
              {pastTasks.length === 0 && (
                <p className="text-center text-zinc-400 italic py-4">
                  No unfinished tasks! 🎉
                </p>
              )}
              {pastTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => togglePastTask(task.id)}
                  className={`
                        p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all
                        ${
                          selectedPastTasks.includes(task.id)
                            ? "border-zinc-900 bg-white shadow-md"
                            : "border-transparent bg-white shadow-sm opacity-60 hover:opacity-100"
                        }
                    `}
                >
                  <span className="font-medium">{task.title}</span>
                  <div
                    className={`
                        w-6 h-6 rounded-full flex items-center justify-center transition-colors
                        ${
                          selectedPastTasks.includes(task.id)
                            ? "bg-zinc-900 text-white"
                            : "bg-zinc-100 text-zinc-300"
                        }
                    `}
                  >
                    <Check size={14} strokeWidth={3} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={nextStep}
                className="flex items-center font-bold text-zinc-900 hover:opacity-70 transition-opacity"
              >
                Next <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Today's Plan */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="text-center mb-8">
              <span className="inline-block p-3 bg-blue-100 text-blue-600 rounded-full mb-4">
                <Sunrise size={24} />
              </span>
              <h1 className="text-2xl font-bold mb-2">Today's Intention</h1>
              <p className="text-zinc-500 text-sm">
                Focus on:{" "}
                <span className="font-semibold text-zinc-700">
                  {weeklyGoal?.title || "No Weekly Goal"}
                </span>
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 mb-6">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
                Task List
              </h3>

              {selectedPastTasks.length > 0 && (
                <div className="mb-4 space-y-2">
                  {pastTasks
                    .filter((t) => selectedPastTasks.includes(t.id))
                    .map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center text-sm text-zinc-600"
                      >
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2" />
                        {t.title}
                      </div>
                    ))}
                </div>
              )}

              <div className="space-y-2">
                {todaysTasks.map((t) => (
                  <div
                    key={t.id}
                    className="group flex items-center justify-between text-sm font-medium text-zinc-800 py-1"
                  >
                    <span>{t.title}</span>
                    <button
                      onClick={() => removeTodaysTask(t.id!)}
                      className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <form
                onSubmit={addTodaysTask}
                className="mt-4 flex items-center border-t border-zinc-100 pt-3"
              >
                <Plus size={18} className="text-zinc-400 mr-2" />
                <input
                  type="text"
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  placeholder="Add a main task..."
                  className="flex-grow bg-transparent text-sm font-medium placeholder:text-zinc-300 focus:outline-none"
                />
              </form>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={prevStep}
                className="text-sm font-medium text-zinc-400 hover:text-zinc-600 flex items-center"
              >
                <ArrowLeft size={16} className="mr-1" /> Back
              </button>
              <button
                onClick={nextStep}
                className="flex items-center font-bold text-zinc-900 hover:opacity-70 transition-opacity"
              >
                Review <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Commitment */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 text-center">
            <div className="mb-10 pt-8">
              <h1 className="text-4xl font-bold mb-4 tracking-tight">Ready?</h1>
              <p className="text-lg text-zinc-500 leading-relaxed">
                "The secret of getting ahead is getting started."
              </p>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-2xl mb-10 text-left max-w-sm mx-auto transform rotate-1">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                Summary
              </p>
              <p className="text-2xl font-bold text-zinc-900 mb-1">
                {selectedPastTasks.length + todaysTasks.length} Tasks
              </p>
              <p className="text-sm text-zinc-500">
                Estimated time:{" "}
                {(selectedPastTasks.length + todaysTasks.length) * 30} mins
              </p>
            </div>

            <button
              onClick={handleFinish}
              disabled={isSubmitting}
              className="w-full bg-zinc-900 text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-zinc-200 hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? "Setting up..." : "Start Day"}
            </button>
            <button
              onClick={prevStep}
              className="mt-6 text-sm font-medium text-zinc-400 hover:text-zinc-600"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
