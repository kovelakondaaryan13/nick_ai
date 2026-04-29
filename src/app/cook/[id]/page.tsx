import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CookModeClient from "./cook-mode-client";

export default async function CookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: recipe } = await supabase
    .from("recipes")
    .select("id, title, steps, hero_image_url")
    .eq("id", id)
    .single();

  if (!recipe) notFound();

  return <CookModeClient recipe={recipe} />;
}
