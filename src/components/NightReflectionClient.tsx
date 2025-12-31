"use client";

import { useState } from "react";
import { Moon, ArrowRight, Trophy } from "lucide-react";
import { completeDay } from "@/app/actions";

interface NightReflectionClientProps {
  completedCount: number;
  totalCount: number;
  progress: number;
}

export default function NightReflectionClient({
  completedCount,
  totalCount,
  progress,
}: NightReflectionClientProps) {
  const [journal, setJournal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await completeDay(journal, progress);
    } catch (error) {
      console.error("Failed to commit day:", error);
      setIsSubmitting(false);
      // Handle error (alert or toast)
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6 text-zinc-900 font-sans flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 pt-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Moon size={24} className="text-indigo-900" />
          Night Reflection
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow space-y-8">
        {/* Stats Card */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
          <div className="mb-4 p-4 bg-indigo-50 text-indigo-600 rounded-full">
            <Trophy size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-bold text-zinc-900 mb-1">
            Great Job Today!
          </h2>
          <div className="text-4xl font-extrabold text-indigo-900 my-2">
            {completedCount}{" "}
            <span className="text-lg font-medium text-zinc-400">
              / {totalCount}
            </span>
          </div>
          <p className="text-sm text-zinc-500">Tasks Completed ({progress}%)</p>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-zinc-100 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-indigo-900 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>

        {/* Journaling Section */}
        <section className="animate-in slide-in-from-bottom-4 duration-500 delay-100">
          <label className="block text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Journal
          </label>
          <div className="relative">
            <textarea
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
              placeholder="How was your day? What did you accomplish? What can be improved?"
              disabled={isSubmitting}
              className="w-full h-48 p-4 rounded-xl border border-zinc-200 bg-white text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-900/20 focus:border-indigo-900 transition-all resize-none leading-relaxed disabled:opacity-50"
            />
          </div>
        </section>
      </main>

      {/* Footer Action */}
      <footer className="pt-6 pb-2 animate-in slide-in-from-bottom-4 duration-500 delay-200">
        <button
          onClick={handleFinish}
          disabled={isSubmitting}
          className="w-full bg-indigo-950 hover:bg-indigo-900 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Finish Day (Shutdown)"}
          {!isSubmitting && <ArrowRight size={20} className="ml-2" />}
        </button>
      </footer>
    </div>
  );
}
