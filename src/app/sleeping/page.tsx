"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SleepingPage() {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);

  // Reset click count after 2 seconds of inactivity
  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => {
        setClickCount(0);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  const handleHiddenCommand = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 5) {
      // Unlock / Go back to home
      router.push("/morning");
    }
  };

  return (
    <div
      onClick={handleHiddenCommand}
      className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center select-none cursor-default overflow-hidden"
    >
      {/* Subtle decorative element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative animate-in fade-in duration-1000 zoom-in-95">
        <p className="text-zinc-500 font-serif text-lg tracking-widest block mb-4">
          GOOD NIGHT
        </p>
        <p className="text-zinc-700 text-sm">See you tomorrow at 06:30.</p>
      </div>

      {/* Debug indication for clicks (Optional: comment out for true difficulty) */}
      {/* {clickCount > 0 && <div className="absolute bottom-4 text-zinc-900 text-xs">.{clickCount}</div>} */}
    </div>
  );
}
