import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

const DEMO_RESPONSES: Record<string, string> = {
  eggs: "Perfect — classic bachelor move. Here's what I'd make: a crispy fried egg sandwich with melted cheese. 8 minutes, one pan, no cleanup. Want me to walk you through it?",
  bread: "Perfect — classic bachelor move. Here's what I'd make: a crispy fried egg sandwich with melted cheese. 8 minutes, one pan, no cleanup. Want me to walk you through it?",
  bachelor: "Perfect — classic bachelor move. Here's what I'd make: a crispy fried egg sandwich with melted cheese. 8 minutes, one pan, no cleanup. Want me to walk you through it?",
  "1 pan": "Perfect — classic bachelor move. Here's what I'd make: a crispy fried egg sandwich with melted cheese. 8 minutes, one pan, no cleanup. Want me to walk you through it?",
  chicken: "Garlic butter chicken, 15 minutes, one pan. Trust me on this one.",
  pasta: "Cacio e pepe — 3 ingredients, 12 minutes, tastes like a Roman restaurant.",
};

const DEFAULT_RESPONSE = "Nice — I've got the perfect recipe for that. Want something quick or are we going all out?";

function getDemoResponse(message: string): string {
  const lower = message.toLowerCase();
  for (const [keyword, response] of Object.entries(DEMO_RESPONSES)) {
    if (lower.includes(keyword)) return response;
  }
  return DEFAULT_RESPONSE;
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

  const demoText = getDemoResponse(lastUserMessage);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // AI SDK v6 UI message stream format
      controller.enqueue(encoder.encode(`0:${JSON.stringify(demoText)}\n`));
      controller.enqueue(encoder.encode(`d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n`));
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
