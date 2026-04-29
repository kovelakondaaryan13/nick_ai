"use client";

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";

export interface CircularTimerHandle {
  pause: () => void;
  resume: () => void;
  isPaused: () => boolean;
}

interface CircularTimerProps {
  durationSec: number;
  onComplete: () => void;
}

const CircularTimer = forwardRef<CircularTimerHandle, CircularTimerProps>(
  function CircularTimer({ durationSec, onComplete }, ref) {
    const [remaining, setRemaining] = useState(durationSec);
    const [paused, setPaused] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const completedRef = useRef(false);

    useImperativeHandle(ref, () => ({
      pause: () => setPaused(true),
      resume: () => setPaused(false),
      isPaused: () => paused,
    }), [paused]);

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
          <circle cx="60" cy="60" r="54" fill="none" stroke="#2A2A2A" strokeWidth="6" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={remaining === 0 ? "#4CAF50" : "#FF6B35"}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums text-[#F5F0E8]">
            {mins}:{secs.toString().padStart(2, "0")}
          </span>
          <span className="text-xs text-[#9A9A8A]">
            {remaining === 0 ? "done!" : paused ? "paused" : "tap to pause"}
          </span>
        </div>
      </button>
    );
  }
);

export default CircularTimer;
