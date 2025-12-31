import { useState, useRef, useEffect } from "react";
import { X, Clock } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, durationMinutes: number) => void;
};

export function AddTaskDialog({ isOpen, onClose, onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("30");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setTitle(""); // Reset on close
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title, parseInt(duration) || 0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100">
            <h3 className="text-lg font-bold text-zinc-900">New Task</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Title
              </label>
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full text-lg font-medium border-b-2 border-zinc-100 py-2 focus:outline-none focus:border-zinc-900 transition-colors placeholder:text-zinc-300 text-zinc-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Estimated Time (min)
              </label>
              <div className="flex items-center space-x-4">
                {[15, 30, 45, 60, 90].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDuration(m.toString())}
                    className={`
                                    px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                                    ${
                                      duration === m.toString()
                                        ? "bg-zinc-900 text-white"
                                        : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                                    }
                                `}
                  >
                    {m}m
                  </button>
                ))}
              </div>
              <div className="mt-3 relative">
                <Clock
                  className="absolute left-3 top-2.5 text-zinc-400"
                  size={16}
                />
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="pl-10 w-24 bg-zinc-50 border border-zinc-200 rounded-lg py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>
            </div>
          </div>

          <div className="p-6 pt-2">
            <button
              type="submit"
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-zinc-200 active:scale-[0.98] transition-all"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
