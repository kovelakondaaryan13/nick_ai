import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("dietary_flags, allergens")
    .eq("user_id", user.id)
    .single();

  let query = supabase
    .from("recipes")
    .select("id, title, hero_image_url, time_minutes, kcal, cuisine, tags, difficulty");

  if (profile?.dietary_flags?.vegetarian) {
    query = query.not("tags", "cs", '{"meat"}');
  }

  const { data: recipes } = await query;

  if (!recipes || recipes.length === 0) {
    return NextResponse.json({ recipe: null });
  }

  let filtered = recipes;
  if (profile?.allergens?.length > 0) {
    filtered = recipes.filter(
      (r) => !r.tags?.some((t: string) => profile!.allergens.includes(t))
    );
  }

  if (filtered.length === 0) filtered = recipes;

  const random = filtered[Math.floor(Math.random() * filtered.length)];

  const { count } = await supabase
    .from("recipes")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({ recipe: random, totalRecipes: count || filtered.length });
}
