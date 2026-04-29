"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, ChevronRight, Filter } from "lucide-react";

interface Meal {
  id: string;
  recipe_id: string;
  completed_at: string;
  rating: number | null;
  recipe: {
    id: string;
    title: string;
    hero_image_url: string;
    time_minutes: number;
    difficulty: string;
    cuisine: string;
  };
}

interface Props {
  meals: Meal[];
  stats: { thisWeekCount: number; avgRating: string; reorders: number };
}

function groupByRecency(meals: Meal[]) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(todayStart.getTime() - 6 * 86400000);

  const groups: { label: string; meals: Meal[] }[] = [
    { label: "TODAY", meals: [] },
    { label: "YESTERDAY", meals: [] },
    { label: "THIS WEEK", meals: [] },
    { label: "EARLIER", meals: [] },
  ];

  for (const m of meals) {
    const d = new Date(m.completed_at);
    if (d >= todayStart) groups[0].meals.push(m);
    else if (d >= yesterdayStart) groups[1].meals.push(m);
    else if (d >= weekStart) groups[2].meals.push(m);
    else groups[3].meals.push(m);
  }

  return groups.filter((g) => g.meals.length > 0);
}

export default function PastMealsClient({ meals, stats }: Props) {
  const [showFilter, setShowFilter] = useState(false);
  const [cuisineFilter, setCuisineFilter] = useState<string | null>(null);
  const [minRating, setMinRating] = useState(0);

  const cuisines = [...new Set(meals.map((m) => m.recipe.cuisine).filter(Boolean))];

  const filtered = meals.filter((m) => {
    if (cuisineFilter && m.recipe.cuisine !== cuisineFilter) return false;
    if (minRating > 0 && (!m.rating || m.rating < minRating)) return false;
    return true;
  });

  const groups = groupByRecency(filtered);

  return (
    <div className="px-4 pt-12 pb-4 bg-[#0F0F0F] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#F5F0E8] font-[family-name:var(--font-playfair)]">Past Meals</h1>
        <button onClick={() => setShowFilter(!showFilter)} className="p-2" aria-label="Filter meals">
          <Filter className="h-5 w-5 text-[#9A9A8A]" />
        </button>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-dashed border-[#2A2A2A] bg-[#1A1A1A] p-3 text-center">
          <p className="text-lg font-bold text-[#F5F0E8]">{stats.thisWeekCount}</p>
          <p className="text-[10px] text-[#9A9A8A]">THIS WEEK</p>
        </div>
        <div className="rounded-xl border border-dashed border-[#2A2A2A] bg-[#1A1A1A] p-3 text-center">
          <p className="text-lg font-bold text-[#F5F0E8]">{stats.avgRating}</p>
          <p className="text-[10px] text-[#9A9A8A]">AVG RATING</p>
        </div>
        <div className="rounded-xl border border-dashed border-[#2A2A2A] bg-[#1A1A1A] p-3 text-center">
          <p className="text-lg font-bold text-[#F5F0E8]">{stats.reorders}</p>
          <p className="text-[10px] text-[#9A9A8A]">REORDERS</p>
        </div>
      </div>

      {/* Filter sheet */}
      {showFilter && (
        <div className="mt-3 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-4">
          <p className="mb-2 text-xs font-semibold text-[#9A9A8A]">CUISINE</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCuisineFilter(null)}
              className={`rounded-full border px-3 py-1 text-xs ${
                !cuisineFilter ? "border-[#FF6B35] bg-[#FF6B35] text-white" : "border-[#2A2A2A] text-[#F5F0E8]"
              }`}
            >
              All
            </button>
            {cuisines.map((c) => (
              <button
                key={c}
                onClick={() => setCuisineFilter(cuisineFilter === c ? null : c)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  cuisineFilter === c ? "border-[#FF6B35] bg-[#FF6B35] text-white" : "border-[#2A2A2A] text-[#F5F0E8]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <p className="mb-2 mt-4 text-xs font-semibold text-[#9A9A8A]">MIN RATING</p>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                onClick={() => setMinRating(r)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  minRating === r ? "border-[#FF6B35] bg-[#FF6B35] text-white" : "border-[#2A2A2A] text-[#F5F0E8]"
                }`}
              >
                {r === 0 ? "Any" : `${r}+`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grouped meals */}
      <div className="mt-6 space-y-6">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 text-[10px] font-medium tracking-wider text-[#9A9A8A]">
              {group.label}
            </p>
            <div className="space-y-2">
              {group.meals.map((meal) => (
                <div
                  key={meal.id}
                  className="flex items-center gap-3 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-3"
                >
                  <Link href={`/recipes/${meal.recipe.id}`} className="flex flex-1 items-center gap-3">
                    <img
                      src={meal.recipe.hero_image_url}
                      alt={meal.recipe.title}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate text-sm font-semibold text-[#F5F0E8]">{meal.recipe.title}</h3>
                      <p className="text-xs text-[#9A9A8A]">
                        {meal.recipe.time_minutes} min · {meal.recipe.difficulty}
                      </p>
                      {meal.rating && (
                        <div className="mt-0.5 flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3 w-3 ${
                                s <= meal.rating! ? "fill-[#FF6B35] text-[#FF6B35]" : "text-[#2A2A2A]"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-[#9A9A8A]" />
                  </Link>
                  <Link
                    href={`/cook/${meal.recipe.id}`}
                    className="flex-shrink-0 rounded-full bg-[#FF6B35] px-3 py-1.5 text-xs font-medium text-white"
                  >
                    Cook again
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
