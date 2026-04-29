"use client";

import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/stores/onboarding";

const ALLERGENS = ["Peanuts", "Shellfish", "Dairy", "Eggs", "Soy", "Tree nuts"];

export default function DietaryStep() {
  const router = useRouter();
  const { vegetarian, glutenFree, allergens, setVegetarian, setGlutenFree, toggleAllergen } =
    useOnboardingStore();

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-xl font-bold">Any dietary needs?</h1>
      <p className="mt-1 text-sm text-[#9A9A8A]">Nick will never suggest something that doesn&apos;t work for you.</p>

      <div className="mt-6 flex flex-col gap-4">
        <Toggle label="Vegetarian" checked={vegetarian} onChange={setVegetarian} />
        <Toggle label="Gluten-free" checked={glutenFree} onChange={setGlutenFree} />
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-[#9A9A8A]">Allergens</p>
        <div className="flex flex-wrap gap-3">
          {ALLERGENS.map((a) => {
            const selected = allergens.includes(a.toLowerCase());
            return (
              <button
                key={a}
                onClick={() => toggleAllergen(a.toLowerCase())}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                  selected
                    ? "bg-[#FF6B35] text-white"
                    : "border border-[#2A2A2A] bg-transparent text-[#F5F0E8]"
                }`}
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto flex w-full flex-col gap-3 pt-12">
        <button
          onClick={() => router.push("/onboarding/tools")}
          className="w-full rounded-lg bg-[#FF6B35] py-3.5 text-sm font-semibold text-white"
        >
          Continue
        </button>
        <button
          onClick={() => router.push("/onboarding/tools")}
          className="text-sm text-[#9A9A8A] underline"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between rounded-lg border border-[#2A2A2A] px-4 py-3"
    >
      <span className="text-sm font-medium text-[#F5F0E8]">{label}</span>
      <div
        className={`h-6 w-11 rounded-full p-0.5 transition-colors ${
          checked ? "bg-[#FF6B35]" : "bg-[#2A2A2A]"
        }`}
      >
        <div
          className={`h-5 w-5 rounded-full bg-[#F5F0E8] transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </button>
  );
}
