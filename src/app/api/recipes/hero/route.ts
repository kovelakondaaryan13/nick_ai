import { createClient } from "@/lib/supabase/server";
import { embed } from "@/lib/openai";
import { searchRecipes } from "@/lib/qdrant";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("taste_fingerprint, dietary_flags, allergens")
      .eq("user_id", user.id)
      .single();

    let recipeIds: string[] = [];

    // Wrap Qdrant + embed in try/catch so failures fall through to Supabase fallback
    try {
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
    } catch (qdrantError) {
      console.error("[hero] Qdrant/embed failed, falling back to Supabase:", qdrantError);
      recipeIds = [];
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

    if (!recipes || recipes.length === 0) {
      console.error("Hero: primary query returned empty, using safety fallback");
      const { data: fallbackRecipes } = await supabase
        .from("recipes")
        .select("id, title, hero_image_url, time_minutes, kcal, tags, difficulty")
        .limit(5);
      recipes = fallbackRecipes;
    }

    return NextResponse.json({ recipes: recipes || [] });
  } catch (error) {
    console.error("[hero] Unhandled error in hero route:", error);
    return NextResponse.json({ recipes: [] });
  }
}
