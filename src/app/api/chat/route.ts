import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const KEYWORD_RESPONSES: [string[], string][] = [
  [
    ["asparagus", "broccoli", "spinach", "basil", "fridge"],
    "Oh nice fridge! Lemon garlic asparagus stir fry — 12 minutes, one pan, incredibly fresh. Want me to walk you through it step by step?",
  ],
  [
    ["walk", "yes", "step", "guide"],
    "Let's go! I've pulled up the recipe. Tap Cook Mode and I'll guide you through every step live!",
  ],
  [
    ["eggs", "bread", "cheese", "bachelor", "1 pan"],
    "Classic! Crispy fried egg sandwich with melted cheese. 8 minutes, one pan, no cleanup. Want to cook it?",
  ],
  [
    ["chicken"],
    "Garlic butter chicken — 15 minutes, one pan. This one never fails. Want the steps?",
  ],
  [
    ["pasta"],
    "Cacio e pepe — 3 ingredients, 12 minutes, tastes like a Roman restaurant. Shall we cook?",
  ],
  [
    ["tomato", "lemon", "quick", "meal"],
    "Oh nice fridge! Lemon garlic asparagus stir fry — 12 minutes, one pan, incredibly fresh. Want me to walk you through it step by step?",
  ],
  [
    ["comfort"],
    "Mac and cheese with a crispy breadcrumb top — 20 minutes, pure comfort. Want the steps?",
  ],
  [
    ["surprise", "random"],
    "How about crispy sesame tofu bowls? 15 minutes, packed with flavor. Want me to walk you through it?",
  ],
  [
    ["healthy", "light"],
    "Mediterranean quinoa bowl — fresh, light, 12 minutes. Loaded with veggies and a lemon tahini drizzle. Want the steps?",
  ],
];

const FALLBACK_RESPONSE =
  "I love that! I've got the perfect recipe. Want something quick or are we going all out?";

function getResponse(message: string): string {
  const lower = message.toLowerCase();
  for (const [keywords, response] of KEYWORD_RESPONSES) {
    if (keywords.some((kw) => lower.includes(kw))) return response;
  }
  return FALLBACK_RESPONSE;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { message } = body;
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  const reply = getResponse(message);
  return NextResponse.json({ reply });
}
