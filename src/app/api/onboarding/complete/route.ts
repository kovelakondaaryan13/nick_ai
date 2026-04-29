import { createClient } from "@/lib/supabase/server";
import { embed } from "@/lib/openai";
import { upsertMemory } from "@/lib/qdrant";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (body.skip) {
    await supabase
      .from("profiles")
      .update({ onboarding_complete: true })
      .eq("user_id", user.id);

    return NextResponse.json({ ok: true });
  }

  const { taste_fingerprint, dietary_flags, allergens, kitchen_tools } = body;

  // Update profile
  await supabase
    .from("profiles")
    .update({
      taste_fingerprint: taste_fingerprint || [],
      dietary_flags: dietary_flags || { vegetarian: false, gluten_free: false },
      allergens: allergens || [],
      kitchen_tools: kitchen_tools || [],
      onboarding_complete: true,
    })
    .eq("user_id", user.id);

  // Embed taste fingerprint to Qdrant memory
  if (taste_fingerprint && taste_fingerprint.length > 0) {
    const text = [...taste_fingerprint, ...(allergens || [])].join(" ");
    const vector = await embed(text);

    await upsertMemory(randomUUID(), vector, {
      user_id: user.id,
      memory_type: "fingerprint",
      content: text,
      created_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ ok: true });
}
