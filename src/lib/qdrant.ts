import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

export const COLLECTIONS = {
  RECIPES: "recipes_v1",
  MEMORY: "user_memory",
} as const;

export async function upsertRecipe(
  id: string,
  vector: number[],
  payload: Record<string, unknown>
) {
  await qdrant.upsert(COLLECTIONS.RECIPES, {
    wait: true,
    points: [{ id, vector, payload }],
  });
}

export async function searchRecipes(
  vector: number[],
  limit: number = 5,
  filter?: Record<string, unknown>
) {
  return qdrant.search(COLLECTIONS.RECIPES, {
    vector,
    limit,
    with_payload: true,
    ...(filter ? { filter } : {}),
  });
}

export async function upsertMemory(
  id: string,
  vector: number[],
  payload: Record<string, unknown>
) {
  await qdrant.upsert(COLLECTIONS.MEMORY, {
    wait: true,
    points: [{ id, vector, payload }],
  });
}

export async function searchMemory(
  vector: number[],
  userId: string,
  limit: number = 5
) {
  return qdrant.search(COLLECTIONS.MEMORY, {
    vector,
    limit,
    with_payload: true,
    filter: {
      must: [{ key: "user_id", match: { value: userId } }],
    },
  });
}
