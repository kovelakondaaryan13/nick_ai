"use client";

import { useEffect, useState } from "react";
import { HeroRecipeCard } from "@/components/recipe-card";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOff, RefreshCw } from "lucide-react";
import Link from "next/link";

interface Recipe {
  id: string;
  title: string;
  hero_image_url: string;
  time_minutes: number;
  kcal: number;
  tags: string[];
  difficulty: string;
}

export default function HomeClient() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const { online, check } = useOnlineStatus();

  useEffect(() => {
    fetch("/api/recipes/hero")
      .then((r) => r.json())
      .then((d) => setRecipes(d.recipes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {!online && (
        <div className="mb-4 rounded-xl border border-dashed border-[#D0D0D0] px-4 py-3">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-[#A0A0A0]" />
            <span className="text-xs font-medium text-[#6B6B6B]">
              You&apos;re offline · showing cached recommendations
            </span>
            <button onClick={check} className="ml-auto rounded-full border border-[#D0D0D0] p-1.5" aria-label="Retry connection">
              <RefreshCw className="h-3 w-3 text-[#6B6B6B]" />
            </button>
          </div>
        </div>
      )}

      {loading && recipes.length === 0 && (
        <div className="flex gap-4 overflow-x-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[220px] w-[300px] flex-shrink-0 animate-pulse rounded-2xl bg-[#ECECEC]" />
          ))}
        </div>
      )}

      {!loading && recipes.length === 0 && !online && (
        <div className="flex flex-col items-center rounded-2xl border border-[#ECECEC] py-10 text-center">
          <span className="text-3xl">👨‍🍳</span>
          <p className="mt-2 text-sm font-semibold">Nick can&apos;t reach the kitchen</p>
          <p className="mt-1 text-xs text-[#A0A0A0]">Check your connection</p>
          <div className="mt-4 flex gap-2">
            <Link href="/browse" className="rounded-full border border-[#D0D0D0] px-4 py-2 text-xs font-medium">
              View saved
            </Link>
            <button onClick={check} className="rounded-full bg-[#1A1A1A] px-4 py-2 text-xs font-medium text-white">
              Try again
            </button>
          </div>
        </div>
      )}

      {recipes.length > 0 && (
        <>
          <div
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scrollbar-hide"
            onScroll={(e) => {
              const el = e.currentTarget;
              const idx = Math.round(el.scrollLeft / 316);
              setCurrent(idx);
            }}
          >
            {recipes.map((recipe) => (
              <HeroRecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
          <div className="mt-3 flex justify-center gap-1.5">
            {recipes.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? "w-6 bg-[#1A1A1A]" : "w-1.5 bg-[#D0D0D0]"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
