import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, title, hero_image_url, time_minutes, kcal, tags, difficulty")
    .order("created_at", { ascending: false })
    .limit(5);

  return NextResponse.json({ recipes: recipes || [] });
}
