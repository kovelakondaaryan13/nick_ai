import { NextResponse } from "next/server";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

let monthlyChars = 0;

export async function POST(request: Request) {
  const { text } = await request.json();

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  if (!ELEVENLABS_VOICE_ID || ELEVENLABS_VOICE_ID.startsWith("ADD_AFTER")) {
    return NextResponse.json(
      { error: "Voice ID not configured", fallback: "browser" },
      { status: 503 }
    );
  }

  monthlyChars += text.length;
  if (monthlyChars > 9000) {
    console.warn(`[TTS] Approaching ElevenLabs free tier limit: ${monthlyChars} chars this session`);
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

  return new Response(res.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
