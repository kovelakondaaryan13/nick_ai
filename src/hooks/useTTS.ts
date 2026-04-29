"use client";

import { useRef, useCallback } from "react";

export function useTTS() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const prefetchedRef = useRef<Map<string, string>>(new Map());

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    abortRef.current?.abort();
    window.speechSynthesis?.cancel();
  }, []);

  const speak = useCallback(async (text: string, onStart?: () => void, onEnd?: () => void) => {
    stop();

    const prefetched = prefetchedRef.current.get(text);
    if (prefetched) {
      prefetchedRef.current.delete(text);
      const audio = new Audio(prefetched);
      audioRef.current = audio;
      audio.onplay = () => onStart?.();
      audio.onended = () => {
        URL.revokeObjectURL(prefetched);
        onEnd?.();
      };
      audio.play().catch(() => onEnd?.());
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.fallback === "browser") {
          browserTTS(text, onStart, onEnd);
          return;
        }
        onEnd?.();
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onplay = () => onStart?.();
      audio.onended = () => {
        URL.revokeObjectURL(url);
        onEnd?.();
      };
      audio.play().catch(() => onEnd?.());
    } catch {
      browserTTS(text, onStart, onEnd);
    }
  }, [stop]);

  const prefetch = useCallback(async (text: string) => {
    if (prefetchedRef.current.has(text)) return;

    try {
      const controller = new AbortController();
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });

      if (!res.ok) return;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      prefetchedRef.current.set(text, url);
    } catch {}
  }, []);

  return { speak, stop, prefetch };
}

function browserTTS(text: string, onStart?: () => void, onEnd?: () => void) {
  if (!window.speechSynthesis) {
    onEnd?.();
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
}
