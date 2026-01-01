"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Calendar as CalendarIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Types derived from action return type
type HistoryData = Record<
  string,
  {
    log?: { achievementRate: number; journal: string | null };
    tasks: { id: string; title: string }[];
  }
>;

type Props = {
  data: HistoryData;
  year: number;
  month: number;
};

export default function HistoryCalendar({ data, year, month }: Props) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Calendar Logic
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0 = Sunday

  // Navigation Links
  const prevMonthDate = new Date(year, month - 2, 1);
  const nextMonthDate = new Date(year, month, 1);

  const prevLink = `/history?year=${prevMonthDate.getFullYear()}&month=${
    prevMonthDate.getMonth() + 1
  }`;
  const nextLink = `/history?year=${nextMonthDate.getFullYear()}&month=${
    nextMonthDate.getMonth() + 1
  }`;

  const handleDateClick = (day: number) => {
    // Construct key YYYY-MM-DD carefully
    // Using string padStart
    const key = `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
    if (data[key]) {
      setSelectedDate(key);
    } else {
      // Even if no data, select it? Maybe to show empty state?
      // Let's accept click if date is valid
      setSelectedDate(key);
    }
  };

  const selectedData = selectedDate ? data[selectedDate] : null;

  return (
    <div className="max-w-md mx-auto">
      {/* Header / Month Nav */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href={prevLink}
          className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>
        <h2 className="text-xl font-bold">
          {new Date(year, month - 1).toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <Link
          href={nextLink}
          className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
        >
          <ChevronRight size={20} />
        </Link>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-8">
        {/* Day Labels */}
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="text-center text-xs text-zinc-400 font-medium py-2"
          >
            {day}
          </div>
        ))}

        {/* Empty cells for offset */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const key = `${year}-${month.toString().padStart(2, "0")}-${day
            .toString()
            .padStart(2, "0")}`;
          const entry = data[key];

          // Determine color based on achievement rate or activity
          let bgClass = "bg-zinc-100 border-zinc-200"; // Default empty
          let textClass = "text-zinc-400";

          if (entry) {
            textClass = "text-zinc-600 font-medium";
            if (entry.log) {
              const rate = entry.log.achievementRate;
              if (rate >= 80) {
                bgClass =
                  "bg-green-500 border-green-600 text-white font-bold shadow-sm";
                textClass = "text-white";
              } else if (rate >= 50) {
                bgClass = "bg-green-300 border-green-400";
                textClass = "text-green-900";
              } else {
                bgClass = "bg-green-100 border-green-200";
                textClass = "text-green-800";
              }
            } else if (entry.tasks.length > 0) {
              // Only tasks, no log (maybe forgot shutdown)
              bgClass = "bg-zinc-200 border-zinc-300";
            }
          }

          // Check if it is "Today" to highlight border
          const isToday =
            new Date().toDateString() ===
            new Date(year, month - 1, day).toDateString();
          if (isToday) {
            bgClass += " ring-2 ring-indigo-500";
          }

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={`aspect-square rounded-lg border flex items-center justify-center text-sm transition-all hover:scale-105 ${bgClass} ${textClass}`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Details Section (Modal or Bottom sheet simulated) */}
      {selectedDate && (
        <div
          className="fixed inset-0 lg:static lg:inset-auto z-50 flex items-end lg:block bg-black/20 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none"
          onClick={() => setSelectedDate(null)}
        >
          <div
            className="bg-white lg:bg-transparent w-full p-6 rounded-t-3xl lg:rounded-none shadow-2xl lg:shadow-none animate-in slide-in-from-bottom-10 lg:animate-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 lg:hidden">
              <div className="w-12 h-1 bg-zinc-200 rounded-full mx-auto" />
            </div>

            <div className="mb-4">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                {new Date(selectedDate).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {selectedData?.log ? (
                <div className="flex items-baseline mt-1 space-x-2">
                  <span className="text-3xl font-bold text-zinc-900">
                    {selectedData.log.achievementRate}%
                  </span>
                  <span className="text-sm text-zinc-500">Day Achievement</span>
                </div>
              ) : (
                <p className="text-zinc-500 mt-1 italic">
                  No log recorded for this day.
                </p>
              )}
            </div>

            {selectedData?.log?.journal && (
              <div className="mb-6 p-4 bg-zinc-50 rounded-xl border border-zinc-100 italic text-zinc-600">
                "{selectedData.log.journal}"
              </div>
            )}

            <div>
              <h3 className="text-sm font-bold text-zinc-900 mb-3 flex items-center">
                <CalendarIcon size={14} className="mr-2" /> Completed Tasks
              </h3>
              {!selectedData?.tasks || selectedData.tasks.length === 0 ? (
                <p className="text-sm text-zinc-400">No tasks completed.</p>
              ) : (
                <ul className="space-y-2">
                  {selectedData.tasks.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-start text-sm text-zinc-700"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0" />
                      <span className="line-through opacity-75">{t.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
