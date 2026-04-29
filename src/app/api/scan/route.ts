import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const imageFile = formData.get("image") as File | null;

  if (!imageFile) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  if (imageFile.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large." }, { status: 413 });
  }

  if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
    return NextResponse.json({ error: "Unsupported image format. Use JPEG, PNG, or WebP." }, { status: 415 });
  }

  const bytes = await imageFile.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const dataUrl = `data:${imageFile.type || "image/jpeg"};base64,${base64}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: 'Identify all food ingredients visible in this image. Return ONLY valid JSON in this format: {"ingredients": [{"name": "string", "quantity": "string or null", "confidence": "high|medium|low"}]}. Be specific (e.g. "cherry tomatoes" not "vegetables"). Include everything visible including condiments, sauces, beverages.',
          },
          {
            type: "image_url",
            image_url: { url: dataUrl, detail: "low" },
          },
        ],
      },
    ],
    max_tokens: 1024,
  });

  const raw = response.choices[0]?.message?.content || "";

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ ingredients: [], error: "Could not parse response" });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const ingredients: { name: string; quantity: string | null; confidence: string }[] =
      parsed.ingredients || [];

    await supabase.from("fridge_scans").insert({
      user_id: user.id,
      ingredients: ingredients.map((i) => ({ name: i.name, quantity: i.quantity, confidence: i.confidence })),
      scanned_at: new Date().toISOString(),
    });

    return NextResponse.json({ ingredients });
  } catch {
    return NextResponse.json({ ingredients: [], error: "Failed to parse ingredients" });
  }
}
