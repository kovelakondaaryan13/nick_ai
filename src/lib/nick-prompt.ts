interface UserProfile {
  display_name: string | null;
  taste_fingerprint: string[];
  dietary_flags: { vegetarian: boolean; gluten_free: boolean } | null;
  allergens: string[];
  kitchen_tools: string[];
}

interface Memory {
  content: string;
  memory_type: string;
  created_at: string;
}

interface FridgeState {
  ingredients: { name: string }[];
}

export function buildSystemPrompt({
  profile,
  memories,
  fridgeState,
}: {
  profile: UserProfile | null;
  memories: Memory[];
  fridgeState: FridgeState | null;
}): string {
  const parts: string[] = [];

  // Persona block
  parts.push(`You are Nick — Nick DiGiovanni, the chef. You're warm, direct, energetic. You love smashburgers, the perfect crispy thing, and anything with a great crust. You speak in present tense, use simple language, never hedge. You never say you are an AI. You never break character. If asked something off-topic from cooking and food, you redirect warmly: "Not my arena — but if you want to talk about what's for dinner, I'm in." You won't give medical advice (suggest a professional). You won't trash other chefs.

You're cooking with one user at a time — a real home cook, not a customer. Keep replies short (under 150 words). Use line breaks. Talk like a friend, not a manual.

When suggesting recipes, ALWAYS use the suggest_recipes tool. Don't list recipe names in plain text. Maximum 3 recipe cards per response.`);

  // User profile
  if (profile) {
    parts.push(`\n--- USER PROFILE ---
Name: ${profile.display_name || "Home cook"}
Taste preferences: ${profile.taste_fingerprint.length > 0 ? profile.taste_fingerprint.join(", ") : "not set"}
Diet: ${profile.dietary_flags?.vegetarian ? "vegetarian" : "no restrictions"}${profile.dietary_flags?.gluten_free ? ", gluten-free" : ""}
Allergens: ${profile.allergens.length > 0 ? profile.allergens.join(", ") : "none"}
Kitchen tools: ${profile.kitchen_tools.length > 0 ? profile.kitchen_tools.join(", ") : "not specified"}`);
  }

  // Memories
  if (memories.length > 0) {
    parts.push(`\n--- THINGS YOU REMEMBER ABOUT THIS USER ---`);
    memories.forEach((m) => {
      parts.push(`- [${m.memory_type}] ${m.content}`);
    });
  }

  // Fridge state
  if (fridgeState && fridgeState.ingredients.length > 0) {
    parts.push(`\n--- WHAT'S IN THEIR FRIDGE RIGHT NOW ---
${fridgeState.ingredients.map((i) => i.name).join(", ")}`);
  }

  return parts.join("\n");
}
