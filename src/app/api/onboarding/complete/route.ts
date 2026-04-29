import { createClient } from "@/lib/supabase/server";
import { embed } from "@/lib/openai";
import { upsertMemory } from "@/lib/qdrant";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { z } from "zod";

const KNOWN_FLAVORS = ["spicy", "sweet", "umami", "bitter", "sour", "smoky", "herby", "rich"];
const KNOWN_ALLERGENS = ["peanuts", "shellfish", "dairy", "eggs", "soy", "tree nuts", "gluten", "nuts", "fish", "sesame"];
const KNOWN_TOOLS = [
  "stovetop", "oven", "microwave", "blender", "food processor",
  "instant pot", "cast iron pan", "air fryer", "stand mixer", "immersion blender",
  "wok", "grill", "sous vide", "pressure cooker", "dutch oven",
];

const onboardingSchema = z.object({
  skip: z.literal(true).optional(),
  taste_fingerprint: z.array(z.string().transform((s) => s.toLowerCase()).pipe(z.enum(KNOWN_FLAVORS as [string, ...string[]]))).max(8).optional(),
  dietary_flags: z.object({
    vegetarian: z.boolean(),
    gluten_free: z.boolean(),
  }).strict().optional(),
  allergens: z.array(z.string().transform((s) => s.toLowerCase()).pipe(z.enum(KNOWN_ALLERGENS as [string, ...string[]]))).optional(),
  kitchen_tools: z.array(z.string().transform((s) => s.toLowerCase()).pipe(z.enum(KNOWN_TOOLS as [string, ...string[]]))).optional(),
}).strict();

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let rawBody;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = onboardingSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid onboarding data", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const body = parsed.data;

  if (body.skip) {
    await supabase
      .from("profiles")
      .update({ onboarding_complete: true })
      .eq("user_id", user.id);

    const cookieStore = await cookies();
    cookieStore.set("onboarding_complete", "true", { path: "/", maxAge: 60 * 60 * 24 * 7, httpOnly: true, sameSite: "lax" });
    return NextResponse.json({ ok: true });
  }

  const { taste_fingerprint, dietary_flags, allergens, kitchen_tools } = body;

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

  if (taste_fingerprint && taste_fingerprint.length > 0) {
    const text = [...taste_fingerprint, ...(allergens || [])].join(" ");
    try {
      const vector = await embed(text);
      await upsertMemory(randomUUID(), vector, {
        user_id: user.id,
        memory_type: "fingerprint",
        content: text,
        created_at: new Date().toISOString(),
      });
    } catch {}
  }

  const cookieStore = await cookies();
  cookieStore.set("onboarding_complete", "true", { path: "/", maxAge: 60 * 60 * 24 * 7, httpOnly: true, sameSite: "lax" });
  return NextResponse.json({ ok: true });
}
