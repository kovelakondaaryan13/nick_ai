"use client";

import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/stores/onboarding";
import { useState } from "react";

const TOOLS = [
  "Stovetop", "Oven", "Microwave", "Blender", "Food processor",
  "Instant pot", "Cast iron pan", "Air fryer", "Stand mixer", "Immersion blender",
];

export default function ToolsStep() {
  const router = useRouter();
  const store = useOnboardingStore();
  const [loading, setLoading] = useState(false);

  async function handleFinish() {
    setLoading(true);
    const res = await fetch("/api/onboarding/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taste_fingerprint: store.tasteFingerprint,
        dietary_flags: {
          vegetarian: store.vegetarian,
          gluten_free: store.glutenFree,
        },
        allergens: store.allergens,
        kitchen_tools: store.kitchenTools,
      }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-xl font-bold">What&apos;s in your kitchen?</h1>
      <p className="mt-1 text-sm text-[#6B7280]">Helps Nick suggest recipes you can actually make.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        {TOOLS.map((tool) => {
          const selected = store.kitchenTools.includes(tool.toLowerCase());
          return (
            <button
              key={tool}
              onClick={() => store.toggleTool(tool.toLowerCase())}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                selected
                  ? "bg-[#2563EB] text-white"
                  : "border border-[#E5E7EB] bg-transparent text-[#111111]"
              }`}
            >
              {tool}
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex w-full flex-col gap-3 pt-12">
        <button
          onClick={handleFinish}
          disabled={loading}
          className="w-full rounded-lg bg-[#2563EB] py-3.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Setting up..." : "Finish"}
        </button>
        <button
          onClick={() => {
            fetch("/api/onboarding/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ skip: true }),
            }).then(() => {
              router.push("/");
              router.refresh();
            });
          }}
          className="text-sm text-[#6B7280] underline"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
