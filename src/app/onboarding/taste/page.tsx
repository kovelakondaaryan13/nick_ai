"use client";

import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/stores/onboarding";

const FLAVORS = ["Spicy", "Sweet", "Umami", "Bitter", "Sour", "Smoky", "Herby", "Rich"];

export default function TasteStep() {
  const router = useRouter();
  const { tasteFingerprint, toggleTaste } = useOnboardingStore();

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-xl font-bold">What flavors do you lean toward?</h1>
      <p className="mt-1 text-sm text-[#6B6B6B]">Pick 3 or more for better recommendations.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        {FLAVORS.map((flavor) => {
          const selected = tasteFingerprint.includes(flavor.toLowerCase());
          return (
            <button
              key={flavor}
              onClick={() => toggleTaste(flavor.toLowerCase())}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                selected
                  ? "bg-[#1A1A1A] text-white"
                  : "border border-[#D0D0D0] bg-transparent text-[#111111]"
              }`}
            >
              {flavor}
            </button>
          );
        })}
      </div>

      {tasteFingerprint.length > 0 && tasteFingerprint.length < 3 && (
        <p className="mt-3 text-xs text-[#A0A0A0]">
          {3 - tasteFingerprint.length} more for best results
        </p>
      )}

      <div className="mt-auto flex w-full flex-col gap-3 pt-12">
        <button
          onClick={() => router.push("/onboarding/dietary")}
          disabled={tasteFingerprint.length === 0}
          className="w-full rounded-lg bg-[#1A1A1A] py-3.5 text-sm font-semibold text-white disabled:opacity-30"
        >
          Continue
        </button>
        <button
          onClick={() => router.push("/onboarding/dietary")}
          className="text-sm text-[#6B6B6B] underline"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
