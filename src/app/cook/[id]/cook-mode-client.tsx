"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Volume2, VolumeX, ChevronLeft, RotateCcw } from "lucide-react";
import CircularTimer from "./circular-timer";
import { useTTS } from "@/hooks/useTTS";

interface Step {
  title: string;
  body: string;
  image_url: string | null;
  timer_seconds: number | null;
}

interface Recipe {
  id: string;
  title: string;
  steps: Step[];
  hero_image_url: string;
}

export default function CookModeClient({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [voiceOn, setVoiceOn] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cook_voice_enabled") !== "false";
    }
    return true;
  });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const tts = useTTS();

  const step = recipe.steps[currentStep];
  const totalSteps = recipe.steps.length;
  const isLast = currentStep === totalSteps - 1;
  const timerSeconds = step.timer_seconds || parseTimerFromText(step.body);

  const stepText = useCallback(
    (idx: number) => {
      const s = recipe.steps[idx];
      return s ? s.title + ". " + s.body : "";
    },
    [recipe.steps]
  );

  const requestWakeLock = useCallback(async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (started) requestWakeLock();

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && started) requestWakeLock();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      wakeLockRef.current?.release();
      tts.stop();
    };
  }, [started, requestWakeLock, tts]);

  // Speak current step + prefetch next
  useEffect(() => {
    if (started && voiceOn) {
      tts.speak(
        stepText(currentStep),
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );

      // Prefetch next step audio
      if (currentStep < totalSteps - 1) {
        tts.prefetch(stepText(currentStep + 1));
      }
    }
    return () => tts.stop();
  }, [currentStep, started]);

  useEffect(() => {
    localStorage.setItem("cook_voice_enabled", voiceOn.toString());
  }, [voiceOn]);

  function playChime() {
    try {
      const ctx = new AudioContext();
      [0, 200, 400].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.value = 0.3;
        osc.start(ctx.currentTime + delay / 1000);
        osc.stop(ctx.currentTime + delay / 1000 + 0.15);
      });
    } catch {}
  }

  function goNext() {
    tts.stop();
    if (isLast) {
      router.push(`/cook/${recipe.id}/done`);
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  function goBack() {
    tts.stop();
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }

  function repeatStep() {
    if (voiceOn) {
      tts.speak(
        stepText(currentStep),
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  }

  function handleStart() {
    setStarted(true);
    // iOS audio unlock — play a silent audio context on user gesture
    try {
      const ctx = new AudioContext();
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start();
    } catch {}
  }

  if (!started) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[#1A1A1A] px-8 text-center text-white">
        <h1 className="text-2xl font-bold">{recipe.title}</h1>
        <p className="mt-2 text-sm text-white/70">{totalSteps} steps · tap to start</p>
        <button
          onClick={handleStart}
          className="mt-8 rounded-full bg-white px-10 py-4 text-sm font-bold text-[#1A1A1A]"
        >
          Start cooking
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12">
        <button onClick={() => setShowExitConfirm(true)}>
          <X className="h-6 w-6 text-[#6B6B6B]" />
        </button>
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          )}
          <button onClick={() => { setVoiceOn(!voiceOn); if (voiceOn) tts.stop(); }}>
            {voiceOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5 text-[#A0A0A0]" />}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 flex gap-1 px-4">
        {recipe.steps.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i <= currentStep ? "bg-[#1A1A1A]" : "bg-[#ECECEC]"
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 px-4 pt-6">
        <p className="text-xs font-medium uppercase tracking-wider text-[#A0A0A0]">
          Step {currentStep + 1} of {totalSteps} · {recipe.title}
        </p>
        <h2 className="mt-2 text-2xl font-bold">{step.title}</h2>

        {(step.image_url || recipe.hero_image_url) && (
          <img
            src={step.image_url || recipe.hero_image_url}
            alt={step.title}
            className="mt-4 h-40 w-full rounded-xl object-cover"
          />
        )}

        <p className="mt-4 text-lg leading-relaxed text-[#6B6B6B]">{step.body}</p>

        {timerSeconds && timerSeconds > 0 && (
          <div className="mt-6 flex justify-center">
            <CircularTimer
              key={`${currentStep}-${timerSeconds}`}
              durationSec={timerSeconds}
              onComplete={playChime}
            />
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="flex items-center gap-3 border-t border-[#ECECEC] p-4">
        <button onClick={goBack} disabled={currentStep === 0} className="rounded-lg border border-[#ECECEC] p-3 disabled:opacity-30">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={repeatStep} className="rounded-lg border border-[#ECECEC] p-3">
          <RotateCcw className="h-4 w-4" />
        </button>
        <button onClick={goNext} className="flex-1 rounded-lg bg-[#1A1A1A] py-3.5 text-sm font-semibold text-white">
          {isLast ? "Finish" : "Next step"}
        </button>
      </div>

      {/* Exit confirm modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-8">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center">
            <h3 className="text-lg font-bold">Exit cook mode?</h3>
            <p className="mt-2 text-sm text-[#6B6B6B]">Your progress will be saved.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowExitConfirm(false)} className="flex-1 rounded-lg border border-[#ECECEC] py-3 text-sm font-medium">
                Stay
              </button>
              <button
                onClick={() => { tts.stop(); router.push(`/recipes/${recipe.id}`); }}
                className="flex-1 rounded-lg bg-[#1A1A1A] py-3 text-sm font-semibold text-white"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function parseTimerFromText(text: string): number | null {
  const match = text.match(/(\d+)\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)/i);
  if (!match) return null;
  const num = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  if (unit.startsWith("h")) return num * 3600;
  if (unit.startsWith("m")) return num * 60;
  return num;
}
