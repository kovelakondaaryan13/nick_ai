import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const KEYWORD_RESPONSES: [string[], string, boolean][] = [
  [
    ["asparagus", "broccoli", "spinach", "basil", "fridge"],
    "Oh nice fridge! Lemon garlic asparagus stir fry — 12 minutes, one pan, incredibly fresh. Want me to walk you through it step by step?",
    false,
  ],
  [
    ["walk", "yes", "step", "guide", "let's", "cook it", "want the"],
    "Let's go! I've pulled up the recipe. Tap below and I'll guide you through every step live!",
    true,
  ],
  [
    ["eggs", "bread", "cheese", "bachelor", "1 pan"],
    "Classic! Crispy fried egg sandwich with melted cheese. 8 minutes, one pan, no cleanup. Want to cook it?",
    false,
  ],
  [
    ["chicken"],
    "Garlic butter chicken — 15 minutes, one pan. This one never fails. Want the steps?",
    false,
  ],
  [
    ["pasta"],
    "Cacio e pepe — 3 ingredients, 12 minutes, tastes like a Roman restaurant. Shall we cook?",
    false,
  ],
  [
    ["tomato", "lemon", "quick", "meal"],
    "Oh nice fridge! Lemon garlic asparagus stir fry — 12 minutes, one pan, incredibly fresh. Want me to walk you through it step by step?",
    false,
  ],
  [
    ["comfort"],
    "Mac and cheese with a crispy breadcrumb top — 20 minutes, pure comfort. Want the steps?",
    false,
  ],
  [
    ["surprise", "random"],
    "How about crispy sesame tofu bowls? 15 minutes, packed with flavor. Want me to walk you through it?",
    false,
  ],
  [
    ["healthy", "light"],
    "Mediterranean quinoa bowl — fresh, light, 12 minutes. Loaded with veggies and a lemon tahini drizzle. Want the steps?",
    false,
  ],
];

const FALLBACK_RESPONSE =
  "I love that! I've got the perfect recipe. Want something quick or are we going all out?";

function getResponse(message: string): { reply: string; showCookButton: boolean } {
  const lower = message.toLowerCase();
  for (const [keywords, response, showButton] of KEYWORD_RESPONSES) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return { reply: response, showCookButton: showButton };
    }
  }
  return { reply: FALLBACK_RESPONSE, showCookButton: false };
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

  const { reply, showCookButton } = getResponse(message);

  return NextResponse.json({ reply, showCookButton });
}
