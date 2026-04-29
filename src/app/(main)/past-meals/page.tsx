import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Clock } from "lucide-react";
import Link from "next/link";
import PastMealsClient from "./past-meals-client";

export default async function PastMealsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  const { data: sessions } = await supabase
    .from("cook_sessions")
    .select("id, recipe_id, completed_at, rating, recipes(id, title, hero_image_url, time_minutes, difficulty, cuisine)")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  const meals = (sessions || []).map((s) => ({
    id: s.id,
    recipe_id: s.recipe_id,
    completed_at: s.completed_at,
    rating: s.rating,
    recipe: s.recipes as unknown as {
      id: string;
      title: string;
      hero_image_url: string;
      time_minutes: number;
      difficulty: string;
      cuisine: string;
    },
  }));

  if (meals.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[#2A2A2A]">
          <Clock className="h-6 w-6 text-[#9A9A8A]" />
        </div>
        <h2 className="text-lg font-semibold text-[#F5F0E8]">No meals yet</h2>
        <p className="mt-1 text-sm text-[#9A9A8A]">
          Cook your first dish and it&apos;ll show up here. Nick learns from every plate.
        </p>
        <Link
          href="/chat"
          className="mt-6 rounded-full bg-[#FF6B35] px-6 py-3 text-sm font-semibold text-white"
        >
          Ask Nick for an idea
        </Link>
      </div>
    );
  }

  // Compute stats
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisWeekCount = meals.filter(
    (m) => new Date(m.completed_at) >= weekAgo
  ).length;

  const ratings = meals.filter((m) => m.rating).map((m) => m.rating as number);
  const avgRating = ratings.length > 0
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : "—";

  const recipeCounts = new Map<string, number>();
  for (const m of meals) {
    recipeCounts.set(m.recipe_id, (recipeCounts.get(m.recipe_id) || 0) + 1);
  }
  const reorders = [...recipeCounts.values()].filter((c) => c > 1).length;

  return (
    <PastMealsClient
      meals={meals}
      stats={{ thisWeekCount, avgRating: String(avgRating), reorders }}
    />
  );
}
