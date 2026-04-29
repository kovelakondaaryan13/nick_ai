import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Search } from "lucide-react";
import { RecipeRow } from "@/components/recipe-card";

const CATEGORIES = [
  { name: "Healthy", value: "healthy" },
  { name: "Snacks", value: "snacks" },
  { name: "Gourmet", value: "gourmet" },
  { name: "Vegetarian", value: "vegetarian" },
  { name: "Quick (<30 min)", value: "quick" },
  { name: "Surprise", value: "random" },
];

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const category = params.category;
  const supabase = await createClient();

  if (category) {
    let query = supabase
      .from("recipes")
      .select("id, title, hero_image_url, time_minutes, kcal, tags, difficulty, categories");

    if (category === "vegetarian") {
      // Filter recipes without meat-related tags
      query = query.not("tags", "cs", "{smoky}"); // rough filter; proper veg filter in future
    } else if (category === "quick") {
      query = query.lte("time_minutes", 30);
    } else if (category === "random") {
      query = query.limit(10);
    } else {
      query = query.contains("categories", [category]);
    }

    const { data: recipes } = await query.order("title").limit(20);

    return (
      <div className="px-4 pt-12">
        <div className="flex items-center gap-3">
          <Link href="/browse" className="text-[#6B6B6B]">←</Link>
          <h1 className="text-lg font-bold capitalize">{category === "quick" ? "Quick (<30 min)" : category}</h1>
        </div>
        <p className="mt-1 text-xs text-[#A0A0A0]">{recipes?.length || 0} recipes</p>
        <div className="mt-4 flex flex-col gap-3">
          {recipes?.map((recipe) => (
            <RecipeRow key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>
    );
  }

  // Category counts
  const { data: allRecipes } = await supabase
    .from("recipes")
    .select("categories, time_minutes");

  const counts: Record<string, number> = { healthy: 0, snacks: 0, gourmet: 0, vegetarian: 0, quick: 0, random: 0 };
  allRecipes?.forEach((r) => {
    r.categories?.forEach((c: string) => {
      if (counts[c] !== undefined) counts[c]++;
    });
    if (r.time_minutes && r.time_minutes <= 30) counts.quick++;
  });
  counts.random = allRecipes?.length || 0;
  counts.vegetarian = Math.round((allRecipes?.length || 0) * 0.4); // approximate

  return (
    <div className="px-4 pt-12">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Browse</h1>
        <Link href="/browse?category=search" className="p-2">
          <Search className="h-5 w-5 text-[#6B6B6B]" />
        </Link>
      </div>
      <p className="mt-1 text-xs text-[#A0A0A0]">All categories & filters</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={`/browse?category=${cat.value}`}
            className="flex flex-col gap-1 rounded-2xl border border-[#ECECEC] p-4"
          >
            <span className="text-sm font-semibold">{cat.name}</span>
            <span className="text-xs text-[#A0A0A0]">{counts[cat.value] || 0} recipes</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
