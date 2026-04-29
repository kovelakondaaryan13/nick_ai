"use client";

import { useEffect, useState } from "react";
import { HeroRecipeCard } from "@/components/recipe-card";

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

  useEffect(() => {
    fetch("/api/recipes/hero")
      .then((r) => r.json())
      .then((d) => setRecipes(d.recipes || []));
  }, []);

  if (recipes.length === 0) {
    return (
      <div className="flex gap-4 overflow-x-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[220px] w-[300px] flex-shrink-0 animate-pulse rounded-2xl bg-[#ECECEC]" />
        ))}
      </div>
    );
  }

  return (
    <div>
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
      {/* Pagination dots */}
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
    </div>
  );
}
