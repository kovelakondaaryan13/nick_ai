import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

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
    return NextResponse.json({ fallback: "browser" }, { status: 200 });
  }

  try {
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
      return NextResponse.json({ fallback: "browser" }, { status: 200 });
    }

    return new Response(res.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ fallback: "browser" }, { status: 200 });
  }
}
