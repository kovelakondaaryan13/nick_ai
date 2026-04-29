import { QdrantClient } from "@qdrant/js-client-rest";
import "dotenv/config";

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

async function main() {
  const collections = [
    { name: "recipes_v1", size: 1536 },
    { name: "user_memory", size: 1536 },
  ];

  for (const col of collections) {
    const exists = await qdrant
      .getCollection(col.name)
      .then(() => true)
      .catch(() => false);

    if (exists) {
      console.log(`✓ Collection "${col.name}" already exists`);
    } else {
      await qdrant.createCollection(col.name, {
        vectors: { size: col.size, distance: "Cosine" },
      });
      console.log(`✓ Created collection "${col.name}"`);
    }
  }

  console.log("\nDone. Both Qdrant collections ready.");
}

main().catch(console.error);
