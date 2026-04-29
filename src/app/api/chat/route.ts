import { createClient } from "@/lib/supabase/server";
import { buildSystemPrompt } from "@/lib/nick-prompt";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
];

const FALLBACK_RESPONSE =
  "I love that! I've got the perfect recipe. Want something quick or are we going all out?";

const GROQ_FALLBACK =
  "Great ingredients! I'd make a spinach and tomato omelette — 8 minutes, one pan, high protein. Want me to walk you through it?";

function getHardcodedResponse(message: string): string | null {
  const lower = message.toLowerCase();
  for (const [keywords, response] of KEYWORD_RESPONSES) {
    if (keywords.some((kw) => lower.includes(kw))) return response;
  }
  return null;
}

function streamResponse(text: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
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

  // Check hardcoded keyword responses first
  const hardcoded = getHardcodedResponse(lastUserMessage);
  if (hardcoded) {
    return streamResponse(hardcoded);
  }

  // Try Groq, fall back to hardcoded on any failure
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, taste_fingerprint, dietary_flags, allergens, kitchen_tools")
      .eq("user_id", user.id)
      .single();

    const systemPrompt = buildSystemPrompt({
      profile,
      memories: [],
      fridgeState: null,
    });

    const groqMessages = messages.map((m: { role: string; content: string | { text?: string }[] }) => ({
      role: m.role as "user" | "assistant" | "system",
      content:
        typeof m.content === "string"
          ? m.content
          : Array.isArray(m.content)
            ? m.content.map((p: { text?: string }) => p.text || "").join("")
            : String(m.content),
    }));

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "system", content: systemPrompt }, ...groqMessages],
      max_tokens: 512,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || FALLBACK_RESPONSE;
    return streamResponse(reply);
  } catch {
    return streamResponse(GROQ_FALLBACK);
  }
}
