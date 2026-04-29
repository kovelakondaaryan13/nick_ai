"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Volume2, VolumeX, ChevronLeft, RotateCcw, Mic, MicOff } from "lucide-react";
import CircularTimer, { type CircularTimerHandle } from "./circular-timer";
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

type SpeechRecognitionType = typeof window extends { SpeechRecognition: infer T } ? T : any;

function getSpeechRecognition(): (new () => any) | null {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

const COMMANDS: Record<string, string> = {
  next: "next", "next step": "next", "go on": "next", continue: "next",
  back: "back", previous: "back", "go back": "back",
  repeat: "repeat", again: "repeat", "say again": "repeat",
  pause: "pause", "stop timer": "pause",
  resume: "resume", "start timer": "resume",
  exit: "exit", cancel: "exit", "i'm done": "exit", "im done": "exit",
};

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
  const [voiceNavOn, setVoiceNavOn] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cook_voice_nav_enabled") === "true";
    }
    return false;
  });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showVoiceNavTip, setShowVoiceNavTip] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const recognitionRef = useRef<any>(null);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<CircularTimerHandle>(null);
  const tts = useTTS();
  const isSpeakingRef = useRef(false);

  const hasSpeechRecognition = typeof window !== "undefined" && getSpeechRecognition() !== null;

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

  const goNextRef = useRef<() => void>(() => {});
  const goBackRef = useRef<() => void>(() => {});
  const repeatStepRef = useRef<() => void>(() => {});

  useEffect(() => {
    goNextRef.current = () => {
      tts.stop();
      if (currentStep === totalSteps - 1) {
        router.push(`/cook/${recipe.id}/done`);
      } else {
        setCurrentStep((s) => s + 1);
      }
    };
    goBackRef.current = () => {
      tts.stop();
      if (currentStep > 0) setCurrentStep((s) => s - 1);
    };
    repeatStepRef.current = () => {
      if (voiceOn) {
        tts.speak(
          stepText(currentStep),
          () => { setIsSpeaking(true); isSpeakingRef.current = true; },
          () => { setIsSpeaking(false); isSpeakingRef.current = false; }
        );
      }
    };
  }, [currentStep, totalSteps, recipe.id, voiceOn, stepText, tts, router]);

  const handleCommand = useCallback((cmd: string) => {
    switch (cmd) {
      case "next": goNextRef.current(); break;
      case "back": goBackRef.current(); break;
      case "repeat": repeatStepRef.current(); break;
      case "pause": timerRef.current?.pause(); break;
      case "resume": timerRef.current?.resume(); break;
      case "exit": setShowExitConfirm(true); break;
    }
  }, []);

  const startRecognition = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) return;

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const last = event.results[event.results.length - 1];
      if (!last.isFinal) return;
      const transcript = last[0].transcript.toLowerCase().trim();

      for (const [phrase, action] of Object.entries(COMMANDS)) {
        if (transcript.includes(phrase)) {
          handleCommand(action);
          break;
        }
      }
    };

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      if (!isSpeakingRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          if (recognitionRef.current === recognition) {
            try { recognition.start(); } catch {}
          }
        }, 300);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "aborted") return;
      setIsListening(false);
      restartTimeoutRef.current = setTimeout(() => {
        if (recognitionRef.current === recognition) {
          try { recognition.start(); } catch {}
        }
      }, 2000);
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch {}
  }, [handleCommand]);

  const stopRecognition = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    if (started && voiceNavOn) {
      startRecognition();
    } else {
      stopRecognition();
    }
    return () => stopRecognition();
  }, [started, voiceNavOn, startRecognition, stopRecognition]);

  useEffect(() => {
    if (!voiceNavOn || !recognitionRef.current) return;
    if (isSpeaking) {
      try { recognitionRef.current.stop(); } catch {}
    } else if (started) {
      restartTimeoutRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          try { recognitionRef.current.start(); } catch {}
        }
      }, 500);
    }
  }, [isSpeaking, voiceNavOn, started]);

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

  useEffect(() => {
    if (started && voiceOn) {
      tts.speak(
        stepText(currentStep),
        () => { setIsSpeaking(true); isSpeakingRef.current = true; },
        () => { setIsSpeaking(false); isSpeakingRef.current = false; }
      );

      if (currentStep < totalSteps - 1) {
        tts.prefetch(stepText(currentStep + 1));
      }
    }
    return () => tts.stop();
  }, [currentStep, started]);

  useEffect(() => {
    localStorage.setItem("cook_voice_enabled", voiceOn.toString());
  }, [voiceOn]);

  useEffect(() => {
    localStorage.setItem("cook_voice_nav_enabled", voiceNavOn.toString());
  }, [voiceNavOn]);

  useEffect(() => {
    if (started && hasSpeechRecognition) {
      const seen = localStorage.getItem("cook_voice_nav_tip_seen");
      if (!seen) {
        setShowVoiceNavTip(true);
        localStorage.setItem("cook_voice_nav_tip_seen", "true");
        const timer = setTimeout(() => setShowVoiceNavTip(false), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [started, hasSpeechRecognition]);

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
        () => { setIsSpeaking(true); isSpeakingRef.current = true; },
        () => { setIsSpeaking(false); isSpeakingRef.current = false; }
      );
    }
  }

  function handleStart() {
    setStarted(true);
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
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[#0F0F0F] px-8 text-center">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#F5F0E8]">{recipe.title}</h1>
        <p className="mt-2 text-sm text-[#9A9A8A]">{totalSteps} steps · tap to start</p>
        <button
          onClick={handleStart}
          className="mt-8 rounded-full bg-[#FF6B35] px-10 py-4 text-sm font-bold text-white"
        >
          Start cooking
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#0F0F0F]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12">
        <button onClick={() => setShowExitConfirm(true)} aria-label="Exit cook mode">
          <X className="h-6 w-6 text-[#9A9A8A]" />
        </button>
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#4CAF50]" />
          )}
          <button onClick={() => { setVoiceOn(!voiceOn); if (voiceOn) tts.stop(); }} aria-label={voiceOn ? "Mute voice" : "Unmute voice"}>
            {voiceOn ? <Volume2 className="h-5 w-5 text-[#F5F0E8]" /> : <VolumeX className="h-5 w-5 text-[#9A9A8A]" />}
          </button>
          {hasSpeechRecognition && (
            <button
              onClick={() => setVoiceNavOn(!voiceNavOn)}
              className="relative"
              aria-label={voiceNavOn ? "Disable voice navigation" : "Enable voice navigation"}
            >
              {voiceNavOn ? (
                <Mic className={`h-5 w-5 ${isListening ? "text-red-500 animate-pulse" : isSpeaking ? "text-[#9A9A8A]" : "text-[#F5F0E8]"}`} />
              ) : (
                <MicOff className="h-5 w-5 text-[#9A9A8A]" />
              )}
              {isListening && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 animate-ping" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Voice nav tooltip */}
      {showVoiceNavTip && (
        <div className="mx-4 mt-2 rounded-lg bg-[#FF6B35] px-4 py-2.5 text-center text-xs text-white">
          Try saying &quot;next&quot; or &quot;repeat&quot; to navigate hands-free
          <button onClick={() => setShowVoiceNavTip(false)} className="ml-2 text-white/60" aria-label="Dismiss tip">✕</button>
        </div>
      )}

      {/* Progress bar */}
      <div className="mt-4 flex gap-1 px-4">
        {recipe.steps.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i <= currentStep ? "bg-[#FF6B35]" : "bg-[#2A2A2A]"
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 px-4 pt-6">
        <p className="text-xs font-medium uppercase tracking-wider text-[#9A9A8A]">
          Step {currentStep + 1} of {totalSteps} · {recipe.title}
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#F5F0E8]">{step.title}</h2>

        {(step.image_url || recipe.hero_image_url) && (
          <img
            src={step.image_url || recipe.hero_image_url}
            alt={step.title}
            className="mt-4 h-40 w-full rounded-xl object-cover"
          />
        )}

        <p className="mt-4 text-lg leading-relaxed text-[#9A9A8A]">{step.body}</p>

        {timerSeconds && timerSeconds > 0 && (
          <div className="mt-6 flex justify-center">
            <CircularTimer
              ref={timerRef}
              key={`${currentStep}-${timerSeconds}`}
              durationSec={timerSeconds}
              onComplete={playChime}
            />
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="flex items-center gap-3 border-t border-[#2A2A2A] bg-[#1A1A1A] p-4">
        <button onClick={goBack} disabled={currentStep === 0} className="rounded-lg border border-[#2A2A2A] p-3 disabled:opacity-30" aria-label="Previous step">
          <ChevronLeft className="h-5 w-5 text-[#F5F0E8]" />
        </button>
        <button onClick={repeatStep} className="rounded-lg border border-[#2A2A2A] p-3" aria-label="Repeat step">
          <RotateCcw className="h-4 w-4 text-[#F5F0E8]" />
        </button>
        <button onClick={goNext} className="flex-1 rounded-lg bg-[#FF6B35] py-3.5 text-sm font-semibold text-white">
          {isLast ? "Finish" : "Next step"}
        </button>
      </div>

      {/* Exit confirm modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-8" role="dialog" aria-modal="true" aria-labelledby="exit-dialog-title">
          <div className="w-full max-w-sm rounded-2xl bg-[#1A1A1A] p-6 text-center">
            <h3 id="exit-dialog-title" className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#F5F0E8]">Exit cook mode?</h3>
            <p className="mt-2 text-sm text-[#9A9A8A]">Your progress will be saved.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowExitConfirm(false)} className="flex-1 rounded-lg border border-[#2A2A2A] py-3 text-sm font-medium text-[#F5F0E8]">
                Stay
              </button>
              <button
                onClick={() => { tts.stop(); stopRecognition(); router.push(`/recipes/${recipe.id}`); }}
                className="flex-1 rounded-lg bg-[#FF6B35] py-3 text-sm font-semibold text-white"
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
