import { createClient } from "@supabase/supabase-js";
import { QdrantClient } from "@qdrant/js-client-rest";
import OpenAI from "openai";
import { readFileSync } from "fs";
import { join } from "path";
import "dotenv/config";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  optional: boolean;
}

interface Recipe {
  title: string;
  slug: string;
  description: string;
  hero_image_url: string;
  time_minutes: number;
  kcal: number;
  base_servings: number;
  difficulty: string;
  cuisine: string;
  tags: string[];
  categories: string[];
  ingredients: Ingredient[];
  steps: { title: string; body: string; image_url: string | null; timer_seconds: number | null }[];
  notes: string;
}

const MEAT_PATTERN = /chicken|beef|pork|salmon|prawn|shrimp|lamb|fish|anchovy|guanciale/i;

function deriveDietaryFlags(recipe: Recipe) {
  const hasMeat = recipe.ingredients.some((i) => MEAT_PATTERN.test(i.name));
  return { has_meat: hasMeat, vegetarian: !hasMeat };
}

async function embed(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return res.data[0].embedding;
}

async function main() {
  const recipesPath = join(__dirname, "..", "supabase", "seed", "recipes.json");
  const recipes: Recipe[] = JSON.parse(readFileSync(recipesPath, "utf-8"));

  console.log(`Seeding ${recipes.length} recipes...\n`);

  for (let i = 0; i < recipes.length; i++) {
    const r = recipes[i];
    console.log(`[${i + 1}/${recipes.length}] ${r.title}`);

    // Upsert to Supabase (idempotent via slug conflict)
    const { data, error } = await supabase
      .from("recipes")
      .upsert(
        {
          title: r.title,
          slug: r.slug,
          description: r.description,
          hero_image_url: r.hero_image_url,
          time_minutes: r.time_minutes,
          kcal: r.kcal,
          base_servings: r.base_servings,
          difficulty: r.difficulty,
          cuisine: r.cuisine,
          tags: r.tags,
          categories: r.categories,
          ingredients: r.ingredients,
          steps: r.steps,
          notes: r.notes,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (error) {
      console.error(`  ✗ Supabase error: ${error.message}`);
      continue;
    }

    const recipeId = data.id;

    // Embed for Qdrant
    const embeddingText = [
      r.title,
      r.description,
      r.tags.join(" "),
      r.ingredients.map((i) => i.name).join(" "),
    ].join(" ");

    const vector = await embed(embeddingText);
    const dietary = deriveDietaryFlags(r);

    await qdrant.upsert("recipes_v1", {
      wait: true,
      points: [
        {
          id: recipeId,
          vector,
          payload: {
            recipe_id: recipeId,
            title: r.title,
            cuisine: r.cuisine,
            tags: r.tags,
            categories: r.categories,
            time_minutes: r.time_minutes,
            ...dietary,
          },
        },
      ],
    });

    console.log(`  ✓ Supabase + Qdrant (${dietary.vegetarian ? "veg" : "non-veg"})`);
  }

  // Verify counts
  const { count } = await supabase
    .from("recipes")
    .select("*", { count: "exact", head: true });

  const qdrantInfo = await qdrant.getCollection("recipes_v1");

  console.log(`\n--- Verification ---`);
  console.log(`Supabase recipes: ${count}`);
  console.log(`Qdrant recipes_v1 points: ${qdrantInfo.points_count}`);
  console.log(`Done.`);
}

main().catch(console.error);
