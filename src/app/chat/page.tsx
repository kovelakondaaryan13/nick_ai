"use client";

import { useChat } from "@ai-sdk/react";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { X, Settings, ChefHat, Mic, Send, ArrowRight, Camera, Volume2, VolumeX } from "lucide-react";
import { useTTS } from "@/hooks/useTTS";

interface ChatRecipe {
  id: string;
  title: string;
  hero_image_url?: string;
  time_minutes?: number;
  kcal?: number;
  tags?: string[];
}

const SUGGESTED_PROMPTS = [
  "Something quick",
  "Use what's in my fridge",
  "Comfort food",
  "Surprise me",
  "Healthy and light",
];

export default function ChatPage() {
  return (
    <Suspense>
      <ChatInner />
    </Suspense>
  );
}

function ChatInner() {
  const searchParams = useSearchParams();
  const prefilled = searchParams.get("prompt") || "";
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const { messages, sendMessage, status } = useChat();
  const tts = useTTS();
  const [voiceOn, setVoiceOn] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("chat_voice_enabled") === "true";
    }
    return false;
  });
  const lastSpokenRef = useRef<string | null>(null);

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (prefilled && !input && messages.length === 0) {
      setInput(prefilled);
    }
  }, [prefilled]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  useEffect(() => {
    if (!voiceOn || status !== "ready" || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.role !== "assistant") return;

    const textParts = last.parts.filter((p): p is { type: "text"; text: string } => p.type === "text");
    const fullText = textParts.map((p) => p.text).join("");
    if (!fullText || fullText === lastSpokenRef.current) return;

    const sentences = fullText.match(/[^.!?]+[.!?]+/g) || [fullText];
    const voiceText = sentences.slice(0, 2).join(" ").trim();
    lastSpokenRef.current = fullText;
    tts.speak(voiceText);
  }, [status, messages, voiceOn]);

  useEffect(() => {
    localStorage.setItem("chat_voice_enabled", voiceOn.toString());
  }, [voiceOn]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    sendMessage({ text: msg });
    setInput("");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");

        try {
          const res = await fetch("/api/transcribe", { method: "POST", body: formData });
          const { text } = await res.json();
          if (text) setInput(text);
          inputRef.current?.focus();
        } catch {}
      };

      recorder.start();
      setIsRecording(true);
    } catch {}
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="flex h-dvh flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#F8F9FA] px-4 py-3">
        <Link href="/" className="rounded-full p-1" aria-label="Close chat">
          <X className="h-5 w-5 text-[#6B7280]" />
        </Link>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <ChefHat className="h-4 w-4 text-[#2563EB]" />
            <span className="text-sm font-semibold text-[#111111]">Nick · your AI chef</span>
          </div>
          <p className="text-[10px] text-[#6B7280]">online · learns from you</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => { setVoiceOn(!voiceOn); if (voiceOn) tts.stop(); }} className="rounded-full p-1" aria-label={voiceOn ? "Mute voice" : "Unmute voice"}>
            {voiceOn ? <Volume2 className="h-4 w-4 text-[#2563EB]" /> : <VolumeX className="h-4 w-4 text-[#6B7280]" />}
          </button>
          <Link href="/profile" className="rounded-full p-1" aria-label="Settings">
            <Settings className="h-4 w-4 text-[#6B7280]" />
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <ChefHat className="mb-3 h-10 w-10 text-[#2563EB]/40" />
            <p className="text-sm text-[#6B7280]">
              Hey! Ask me anything about cooking.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === "user";

          const textParts = msg.parts.filter(
            (p): p is { type: "text"; text: string } => p.type === "text"
          );
          const fullText = textParts.map((p) => p.text).join("");

          const recipes: ChatRecipe[] = [];
          for (const part of msg.parts) {
            if (
              part.type.startsWith("tool-") &&
              "output" in part &&
              part.output
            ) {
              const output = part.output as { recipes?: ChatRecipe[] };
              if (output.recipes) recipes.push(...output.recipes);
            }
          }

          return (
            <div key={msg.id} className={`mb-3 flex ${isUser ? "justify-end" : "justify-start"}`}>
              {!isUser && (
                <div className="mr-2 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#2563EB]/10">
                  <ChefHat className="h-3.5 w-3.5 text-[#2563EB]" />
                </div>
              )}
              <div className="max-w-[80%]">
                {fullText && (
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isUser
                        ? "bg-[#2563EB] text-white"
                        : "border border-[#E5E7EB] bg-[#F8F9FA] text-[#111111]"
                    }`}
                  >
                    {fullText.split("\n").map((line, i, arr) => (
                      <span key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                )}

                {recipes.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {recipes.map((recipe) => (
                      <InlineChatRecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (messages.length === 0 || messages[messages.length - 1]?.role === "user") && (
          <div className="mb-3 flex justify-start">
            <div className="mr-2 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#2563EB]/10">
              <ChefHat className="h-3.5 w-3.5 text-[#2563EB]" />
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8F9FA] px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#6B7280] [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#6B7280] [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#6B7280] [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested prompts */}
      {messages.length === 0 && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="flex-shrink-0 rounded-full border border-[#E5E7EB] px-3.5 py-1.5 text-xs font-medium text-[#111111] active:bg-[#2563EB] active:border-[#2563EB] active:text-white"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <div className="border-t border-[#E5E7EB] bg-[#F8F9FA] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onPointerDown={startRecording}
            onPointerUp={stopRecording}
            onPointerLeave={stopRecording}
            aria-label={isRecording ? "Recording... release to stop" : "Hold to record voice"}
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
              isRecording ? "bg-red-500 text-white" : "bg-[#F3F4F6] text-[#6B7280]"
            }`}
          >
            <Mic className="h-4 w-4" />
          </button>

          <Link
            href="/scan"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[#6B7280]"
            aria-label="Scan fridge"
          >
            <Camera className="h-4 w-4" />
          </Link>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Nick..."
            className="h-10 flex-1 rounded-full border border-[#E5E7EB] bg-[#F3F4F6] px-4 text-sm text-[#111111] outline-none placeholder:text-[#6B7280]/60 focus:border-[#2563EB]"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-white disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

function InlineChatRecipeCard({ recipe }: { recipe: ChatRecipe }) {
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] p-2.5"
    >
      {recipe.hero_image_url && (
        <img
          src={recipe.hero_image_url}
          alt={recipe.title}
          className="h-16 w-16 rounded-lg object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-[family-name:var(--font-playfair)] text-sm font-semibold text-[#111111]">{recipe.title}</h4>
        <p className="text-xs text-[#6B7280]">
          {recipe.time_minutes ? `${recipe.time_minutes} min` : ""}
          {recipe.kcal ? ` · ${recipe.kcal} kcal` : ""}
        </p>
        <div className="mt-1 flex items-center gap-1 text-xs font-medium text-[#2563EB]">
          Cook this <ArrowRight className="h-3 w-3" />
        </div>
      </div>
    </Link>
  );
}
