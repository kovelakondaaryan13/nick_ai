import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import RecipeDetailClient from "./recipe-detail-client";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: recipe } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (!recipe) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isSaved = false;
  let userTaste: string[] = [];

  if (user) {
    const { data: saved } = await supabase
      .from("saved_recipes")
      .select("recipe_id")
      .eq("user_id", user.id)
      .eq("recipe_id", id)
      .single();
    isSaved = !!saved;

    const { data: profile } = await supabase
      .from("profiles")
      .select("taste_fingerprint")
      .eq("user_id", user.id)
      .single();
    userTaste = profile?.taste_fingerprint || [];
  }

  const matches = recipe.tags?.filter((t: string) => userTaste.includes(t)) || [];

  return (
    <RecipeDetailClient
      recipe={recipe}
      initialSaved={isSaved}
      matches={matches}
    />
  );
}
