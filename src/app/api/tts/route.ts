import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
const DAILY_CHAR_LIMIT = 50_000;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { text } = body;
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  if (!ELEVENLABS_VOICE_ID || ELEVENLABS_VOICE_ID.startsWith("ADD_AFTER")) {
    return NextResponse.json(
      { error: "Voice ID not configured", fallback: "browser" },
      { status: 503 }
    );
  }

  // Check per-user daily character limit
  const today = new Date().toISOString().slice(0, 10);
  const { data: usage } = await supabase
    .from("tts_usage")
    .select("char_count")
    .eq("user_id", user.id)
    .eq("usage_date", today)
    .single();

  const currentCount = usage?.char_count ?? 0;
  if (currentCount + text.length > DAILY_CHAR_LIMIT) {
    return NextResponse.json(
      { error: "Daily voice limit reached. Try again tomorrow.", fallback: "browser" },
      { status: 429 }
    );
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("[TTS] ElevenLabs error:", err);
    return NextResponse.json({ error: "TTS failed", fallback: "browser" }, { status: 502 });
  }

  // Upsert daily usage count
  await supabase.from("tts_usage").upsert(
    { user_id: user.id, usage_date: today, char_count: currentCount + text.length },
    { onConflict: "user_id,usage_date" }
  );

  return new Response(res.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
