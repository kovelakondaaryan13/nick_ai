import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

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
    ["tomato", "lemon", "quick"],
    "Oh nice fridge! Lemon garlic asparagus stir fry — 12 minutes, one pan, incredibly fresh. Want me to walk you through it step by step?",
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
    return new Response("Unauthorized", { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "Invalid message format" }, { status: 400 });
  }

  const lastMsg = messages[messages.length - 1];
  const lastUserMessage =
    typeof lastMsg.content === "string"
      ? lastMsg.content
      : Array.isArray(lastMsg.content)
        ? lastMsg.content.map((p: { text?: string }) => p.text || "").join("")
        : "";

  const reply = getResponse(lastUserMessage);

  const encoder = new TextEncoder();
  const words = reply.split(" ");
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < words.length; i++) {
        const word = (i === 0 ? "" : " ") + words[i];
        controller.enqueue(encoder.encode(`0:${JSON.stringify(word)}\n`));
        await new Promise((r) => setTimeout(r, 30));
      }
      controller.enqueue(
        encoder.encode(
          `d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n`
        )
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Vercel-AI-Data-Stream": "v1",
    },
  });
}
