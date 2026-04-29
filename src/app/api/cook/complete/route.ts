import { createClient } from "@/lib/supabase/server";
import { embed } from "@/lib/openai";
import { upsertMemory } from "@/lib/qdrant";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { recipe_id, rating } = await request.json();

  // Get recipe title for memory
  const { data: recipe } = await supabase
    .from("recipes")
    .select("title")
    .eq("id", recipe_id)
    .single();

  // Save cook session
  await supabase.from("cook_sessions").insert({
    user_id: user.id,
    recipe_id,
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    current_step: 999,
    rating,
  });

  // Increment meals count
  try {
    await supabase.rpc("increment_meals_count" as string, { uid: user.id });
  } catch {
    // RPC may not exist yet, ignore
  }

  // Embed to Qdrant memory
  if (recipe) {
    const memoryText = `Cooked ${recipe.title} · rated ${rating} stars`;
    const vector = await embed(memoryText);

    await upsertMemory(randomUUID(), vector, {
      user_id: user.id,
      memory_type: "meal",
      content: memoryText,
      source_id: recipe_id,
      created_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ ok: true });
}
