import { createClient } from "@/lib/supabase/server";
import { embed } from "@/lib/openai";
import { searchRecipes } from "@/lib/qdrant";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ recipes: [] });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("taste_fingerprint, dietary_flags, allergens")
    .eq("user_id", user.id)
    .single();

  let recipeIds: string[] = [];

  if (profile?.taste_fingerprint && profile.taste_fingerprint.length > 0) {
    const vector = await embed(profile.taste_fingerprint.join(" "));

    const filter: Record<string, unknown> = {};
    const mustConditions: Record<string, unknown>[] = [];

    if (profile.dietary_flags?.vegetarian) {
      mustConditions.push({ key: "vegetarian", match: { value: true } });
    }

    if (mustConditions.length > 0) {
      filter.must = mustConditions;
    }

    const results = await searchRecipes(vector, 10, mustConditions.length > 0 ? filter : undefined);
    recipeIds = results.map((r) => r.id as string);
  }

  let recipes;
  if (recipeIds.length > 0) {
    const { data } = await supabase
      .from("recipes")
      .select("id, title, hero_image_url, time_minutes, kcal, tags, difficulty")
      .in("id", recipeIds.slice(0, 5));
    recipes = data;
  } else {
    const { data } = await supabase
      .from("recipes")
      .select("id, title, hero_image_url, time_minutes, kcal, tags, difficulty")
      .order("created_at", { ascending: false })
      .limit(5);
    recipes = data;
  }

  return NextResponse.json({ recipes: recipes || [] });
}
