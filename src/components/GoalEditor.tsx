"use client";

import { useState } from "react";
import { Check, X, Edit2, Loader2 } from "lucide-react";

type Props = {
  goalId?: string;
  initialTitle: string;
  type: "monthly" | "weekly";
  onSave: (id: string, title: string) => Promise<void>;
};

export default function GoalEditor({
  goalId,
  initialTitle,
  type,
  onSave,
}: Props) {
  const [isEditing, setIsEditing] = useState(!initialTitle); // Auto-edit if empty
  const [title, setTitle] = useState(initialTitle);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      await onSave(goalId || "", title);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update goal:", error);
      alert("Failed to update goal. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!goalId) {
      // If creating and cancelled, maybe reset to clear?
      // But preventing cancel if it's required?
      // Let's just reset.
    }
    setTitle(initialTitle);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 w-full animate-in fade-in zoom-in-95 duration-200">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`Enter ${type} goal...`}
          className="flex-grow p-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          autoFocus
          disabled={isSaving}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
        </button>
        {goalId && (
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="p-2 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="group relative w-full">
      <div className="p-4 rounded-xl border border-zinc-100 bg-white shadow-sm flex items-start justify-between min-h-[80px] hover:border-indigo-100 transition-colors">
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            {type === "monthly" ? "Monthly Goal" : "Weekly Goal"}
          </p>
          <p className="text-lg font-bold text-zinc-900 leading-snug">
            {title || "Click to set a goal"}
          </p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="text-zinc-300 hover:text-indigo-600 p-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
        >
          <Edit2 size={18} />
        </button>
      </div>
    </div>
  );
}
