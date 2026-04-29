"use client";

import { useState, useEffect, useRef } from "react";

interface CircularTimerProps {
  durationSec: number;
  onComplete: () => void;
}

export default function CircularTimer({ durationSec, onComplete }: CircularTimerProps) {
  const [remaining, setRemaining] = useState(durationSec);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (paused) return;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, onComplete]);

  const progress = remaining / durationSec;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference * (1 - progress);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <button onClick={() => setPaused(!paused)} className="relative h-32 w-32">
      <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="#ECECEC" strokeWidth="6" />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke={remaining === 0 ? "#22c55e" : "#1A1A1A"}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums">
          {mins}:{secs.toString().padStart(2, "0")}
        </span>
        <span className="text-xs text-[#A0A0A0]">
          {remaining === 0 ? "done!" : paused ? "paused" : "tap to pause"}
        </span>
      </div>
    </button>
  );
}
