"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Share2, Bookmark, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  optional: boolean;
}

interface Step {
  title: string;
  body: string;
  image_url: string | null;
  timer_seconds: number | null;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  hero_image_url: string;
  time_minutes: number;
  kcal: number;
  base_servings: number;
  difficulty: string;
  cuisine: string;
  tags: string[];
  ingredients: Ingredient[];
  steps: Step[];
  notes: string;
}

export default function RecipeDetailClient({
  recipe,
  initialSaved,
  matches,
}: {
  recipe: Recipe;
  initialSaved: boolean;
  matches: string[];
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [servings, setServings] = useState(recipe.base_servings);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<"ingredients" | "steps" | "notes">("ingredients");

  const scale = servings / recipe.base_servings;

  function scaleQty(qty: string) {
    const num = parseFloat(qty);
    if (isNaN(num)) return qty;
    const scaled = num * scale;
    return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(1);
  }

  async function toggleSave() {
    setSaved(!saved);
    const method = saved ? "DELETE" : "POST";
    await fetch(`/api/recipes/${recipe.id}/save`, { method });
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: recipe.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    }
  }

  async function addMissingToList() {
    const missing = recipe.ingredients
      .filter((_, i) => !checkedIngredients.has(i))
      .map((ing) => ({
        name: ing.name,
        quantity: scaleQty(ing.quantity),
        unit: ing.unit,
      }));

    const res = await fetch("/api/shopping-list/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: missing, recipe_id: recipe.id }),
    });

    if (res.ok) toast.success(`Added ${missing.length} items to list`);
  }

  return (
    <div className="min-h-dvh bg-white">
      {/* Hero */}
      <div className="relative h-[240px]">
        <img src={recipe.hero_image_url} alt={recipe.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-black/30 to-transparent" />
        <button onClick={() => router.back()} className="absolute left-4 top-12 rounded-full bg-black/50 p-2 backdrop-blur-sm" aria-label="Go back">
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>
        <div className="absolute right-4 top-12 flex gap-2">
          <button onClick={toggleSave} className="rounded-full bg-black/50 p-2 backdrop-blur-sm" aria-label={saved ? "Unsave recipe" : "Save recipe"}>
            <Heart className={`h-5 w-5 ${saved ? "fill-red-500 text-red-500" : "text-white"}`} />
          </button>
          <button onClick={handleShare} className="rounded-full bg-black/50 p-2 backdrop-blur-sm" aria-label="Share recipe">
            <Share2 className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Title */}
        <h1 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#111111]">{recipe.title}</h1>
        {matches.length > 0 && (
          <p className="mt-1 text-xs text-[#6B7280]">
            matches: {matches.join(", ")}
          </p>
        )}

        {/* Meta cards */}
        <div className="mt-4 flex gap-3">
          <div className="flex-1 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] p-3 text-center">
            <p className="text-lg font-bold text-[#111111]">{recipe.time_minutes}</p>
            <p className="text-xs text-[#6B7280]">min</p>
          </div>
          <div className="flex-1 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] p-3 text-center">
            <p className="text-lg font-bold text-[#111111]">{recipe.kcal}</p>
            <p className="text-xs text-[#6B7280]">kcal</p>
          </div>
          <button
            onClick={() => {
              const next = servings === 1 ? 2 : servings === 2 ? 4 : servings === 4 ? 6 : servings === 6 ? 1 : 2;
              setServings(next);
            }}
            className="flex-1 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] p-3 text-center"
          >
            <p className="text-lg font-bold text-[#2563EB]">{servings}</p>
            <p className="text-xs text-[#6B7280]">serves</p>
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex border-b border-[#E5E7EB]">
          {(["ingredients", "steps", "notes"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 pb-2 text-sm font-medium capitalize ${
                activeTab === tab ? "border-b-2 border-[#2563EB] text-[#2563EB]" : "text-[#6B7280]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="mt-4 pb-24">
          {activeTab === "ingredients" && (
            <div>
              {recipe.ingredients.map((ing, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const next = new Set(checkedIngredients);
                    next.has(i) ? next.delete(i) : next.add(i);
                    setCheckedIngredients(next);
                  }}
                  className="flex w-full items-center gap-3 border-b border-[#E5E7EB] py-3"
                >
                  <div className={`h-5 w-5 rounded border-2 ${checkedIngredients.has(i) ? "border-[#2563EB] bg-[#2563EB]" : "border-[#E5E7EB]"}`}>
                    {checkedIngredients.has(i) && <span className="text-xs text-white">✓</span>}
                  </div>
                  <span className={`flex-1 text-left text-sm ${checkedIngredients.has(i) ? "text-[#6B7280] line-through" : "text-[#111111]"}`}>
                    {ing.name} {ing.optional && <span className="text-[#6B7280]">(optional)</span>}
                  </span>
                  <span className="text-sm text-[#6B7280]">
                    {scaleQty(ing.quantity)} {ing.unit}
                  </span>
                </button>
              ))}

              <div className="mt-4 flex flex-col gap-3">
                <button
                  onClick={addMissingToList}
                  className="rounded-lg border-2 border-dashed border-[#E5E7EB] py-3 text-sm font-medium text-[#6B7280]"
                >
                  Add missing to list
                </button>
                <Link
                  href={`/chat?prompt=What can I use instead of an ingredient in ${recipe.title}?`}
                  className="rounded-lg border-2 border-dashed border-[#E5E7EB] py-3 text-center text-sm font-medium text-[#6B7280]"
                >
                  Swap an item
                </Link>
              </div>
            </div>
          )}

          {activeTab === "steps" && (
            <div className="flex flex-col gap-4">
              {recipe.steps.map((step, i) => (
                <div key={i} className="rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] p-4">
                  <p className="text-xs font-medium text-[#6B7280]">Step {i + 1}</p>
                  <h3 className="mt-1 font-[family-name:var(--font-playfair)] font-semibold text-[#111111]">{step.title}</h3>
                  <p className="mt-2 text-sm text-[#6B7280]">{step.body}</p>
                  {step.timer_seconds && (
                    <p className="mt-2 text-xs font-medium text-[#2563EB]">
                      ⏱ {Math.floor(step.timer_seconds / 60)}:{(step.timer_seconds % 60).toString().padStart(2, "0")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "notes" && (
            <p className="text-sm leading-relaxed text-[#6B7280]">{recipe.notes}</p>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 border-t border-[#E5E7EB] bg-[#F8F9FA] p-4">
        <div className="flex gap-3">
          <button onClick={toggleSave} className="rounded-lg border border-[#E5E7EB] p-3" aria-label={saved ? "Unsave recipe" : "Save recipe"}>
            <Bookmark className={`h-5 w-5 ${saved ? "fill-[#2563EB] text-[#2563EB]" : "text-[#111111]"}`} />
          </button>
          <Link
            href={`/cook/${recipe.id}`}
            className="flex flex-1 items-center justify-center rounded-lg bg-[#2563EB] py-3 text-sm font-semibold text-white"
          >
            Start cooking
          </Link>
        </div>
      </div>
    </div>
  );
}
