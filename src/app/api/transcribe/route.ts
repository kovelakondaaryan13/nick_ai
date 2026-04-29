import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(request: Request) {
  const formData = await request.formData();
  const audioFile = formData.get("audio") as File | null;

  if (!audioFile) {
    return NextResponse.json({ error: "No audio file" }, { status: 400 });
  }

  const transcription = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file: audioFile,
  });

  return NextResponse.json({ text: transcription.text });
}
