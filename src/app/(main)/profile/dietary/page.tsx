"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const ALLERGENS = ["dairy", "gluten", "nuts", "shellfish", "soy", "eggs", "fish", "sesame"];

export default function DietaryPage() {
  const router = useRouter();
  const supabase = createClient();
  const [vegetarian, setVegetarian] = useState(false);
  const [glutenFree, setGlutenFree] = useState(false);
  const [allergens, setAllergens] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("dietary_flags, allergens")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setVegetarian(data.dietary_flags?.vegetarian || false);
        setGlutenFree(data.dietary_flags?.gluten_free || false);
        setAllergens(data.allergens || []);
      }
    })();
  }, [supabase]);

  const save = async (v: boolean, gf: boolean, a: string[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("profiles")
      .update({
        dietary_flags: { vegetarian: v, gluten_free: gf },
        allergens: a,
      })
      .eq("user_id", user.id);
  };

  const toggleAllergen = (a: string) => {
    const updated = allergens.includes(a)
      ? allergens.filter((x) => x !== a)
      : [...allergens, a];
    setAllergens(updated);
    save(vegetarian, glutenFree, updated);
  };

  return (
    <div className="px-4 pt-12 pb-4 bg-white min-h-screen">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1" aria-label="Go back">
          <ArrowLeft className="h-5 w-5 text-[#111111]" />
        </button>
        <h1 className="text-lg font-bold text-[#111111] font-[family-name:var(--font-playfair)]">Dietary Needs</h1>
      </div>

      <div className="mt-6 space-y-4">
        <label className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] px-4 py-3">
          <span className="text-sm font-medium text-[#111111]">Vegetarian</span>
          <input
            type="checkbox"
            checked={vegetarian}
            onChange={(e) => {
              setVegetarian(e.target.checked);
              save(e.target.checked, glutenFree, allergens);
            }}
            className="h-5 w-5 accent-[#2563EB]"
          />
        </label>

        <label className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] px-4 py-3">
          <span className="text-sm font-medium text-[#111111]">Gluten-free</span>
          <input
            type="checkbox"
            checked={glutenFree}
            onChange={(e) => {
              setGlutenFree(e.target.checked);
              save(vegetarian, e.target.checked, allergens);
            }}
            className="h-5 w-5 accent-[#2563EB]"
          />
        </label>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
          Allergens
        </p>
        <div className="flex flex-wrap gap-2">
          {ALLERGENS.map((a) => (
            <button
              key={a}
              onClick={() => toggleAllergen(a)}
              aria-pressed={allergens.includes(a)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize ${
                allergens.includes(a)
                  ? "border-[#2563EB] bg-[#2563EB] text-white"
                  : "border-[#E5E7EB] text-[#111111]"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
