import { createClient } from "@/lib/supabase/server";
import { embed } from "@/lib/openai";
import { searchMemory, searchRecipes, upsertMemory } from "@/lib/qdrant";
import { buildSystemPrompt } from "@/lib/nick-prompt";
import { openai as openaiProvider } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import { randomUUID } from "crypto";

export const maxDuration = 30;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const chatBodySchema = z.object({
    messages: z.array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1).max(2000),
      }).passthrough()
    ).min(1),
  }).passthrough();

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = chatBodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid message format", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { messages } = parsed.data;
  const lastUserMessage = messages[messages.length - 1]?.content || "";

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, taste_fingerprint, dietary_flags, allergens, kitchen_tools")
    .eq("user_id", user.id)
    .single();

  // Embed user message and retrieve memories
  let userVector: number[];
  try {
    userVector = await embed(lastUserMessage);
  } catch {
    return Response.json({ error: "Nick's catching his breath. Try again in a sec." }, { status: 429 });
  }

  let memories: { content: string; memory_type: string; created_at: string }[] = [];
  try {
    const memoryResults = await searchMemory(userVector, user.id, 5);
    memories = memoryResults.map((r) => r.payload as { content: string; memory_type: string; created_at: string });
  } catch {}

  // Get recipe candidates — Qdrant first, fallback to Postgres random
  let recipeCandidates: { id: string; title: string; time_minutes: number; kcal: number; cuisine: string; tags: string[] }[] = [];
  try {
    const recipeResults = await searchRecipes(userVector, 5);
    const candidateIds = recipeResults.map((r) => r.id as string);
    if (candidateIds.length > 0) {
      const { data } = await supabase
        .from("recipes")
        .select("id, title, time_minutes, kcal, cuisine, tags, hero_image_url")
        .in("id", candidateIds);
      recipeCandidates = data || [];
    }
  } catch {
    const { data } = await supabase
      .from("recipes")
      .select("id, title, time_minutes, kcal, cuisine, tags, hero_image_url")
      .limit(5);
    recipeCandidates = data || [];
  }

  // Check fridge state
  const { data: fridgeScan } = await supabase
    .from("fridge_scans")
    .select("ingredients")
    .eq("user_id", user.id)
    .order("scanned_at", { ascending: false })
    .limit(1)
    .single();

  const systemPrompt = buildSystemPrompt({
    profile,
    memories,
    fridgeState: fridgeScan,
  });

  const result = streamText({
    model: openaiProvider("gpt-4o"),
    system: systemPrompt,
    messages,
    tools: {
      suggest_recipes: tool({
        description: "Suggest recipes to the user based on their preferences and request. Always use this tool when the user asks for food ideas or what to cook.",
        inputSchema: z.object({
          intent: z.string().describe("What the user is looking for"),
          count: z.number().optional().describe("Number of recipes to suggest (max 3, default 3)"),
        }),
        execute: async ({ intent, count }) => {
          const intentVector = await embed(intent);

          const filter: Record<string, unknown> = {};
          if (profile?.dietary_flags?.vegetarian) {
            filter.must = [{ key: "vegetarian", match: { value: true } }];
          }

          const results = await searchRecipes(intentVector, count || 3, Object.keys(filter).length > 0 ? filter : undefined);
          const ids = results.map((r) => r.id as string);

          if (ids.length === 0) return { recipes: [] };

          const { data: recipes } = await supabase
            .from("recipes")
            .select("id, title, time_minutes, kcal, hero_image_url, tags")
            .in("id", ids);

          return { recipes: recipes || [] };
        },
      }),
      search_recipes: tool({
        description: "Search for specific recipes by query",
        inputSchema: z.object({
          query: z.string().describe("Search query"),
        }),
        execute: async ({ query }) => {
          const queryVector = await embed(query);
          const results = await searchRecipes(queryVector, 5);
          const ids = results.map((r) => r.id as string);

          if (ids.length === 0) return { recipes: [] };

          const { data: recipes } = await supabase
            .from("recipes")
            .select("id, title, time_minutes, kcal, hero_image_url, tags")
            .in("id", ids);

          return { recipes: recipes || [] };
        },
      }),
      request_substitution: tool({
        description: "Suggest ingredient substitutions for a recipe",
        inputSchema: z.object({
          ingredient: z.string().describe("The ingredient to substitute"),
          recipe_title: z.string().describe("The recipe name"),
        }),
        execute: async ({ ingredient, recipe_title }) => {
          return {
            suggestion: `For ${ingredient} in ${recipe_title}, you could try a common substitute. I'll explain in my response.`,
          };
        },
      }),
    },
    prepareStep: () => ({}),
  });

  // Save messages to DB in background (don't block the stream)
  (async () => {
    try {
      await supabase.from("chat_messages").insert({
        user_id: user.id,
        role: "user",
        content: lastUserMessage,
      });

      // Embed user message to memory
      await upsertMemory(randomUUID(), userVector, {
        user_id: user.id,
        memory_type: "chat",
        content: lastUserMessage,
        created_at: new Date().toISOString(),
      });
    } catch {}
  })();

  return result.toUIMessageStreamResponse();
}
