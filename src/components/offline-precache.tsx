"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function OfflinePrecache() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const precache = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: saved } = await supabase
          .from("saved_recipes")
          .select("recipe_id")
          .eq("user_id", user.id)
          .order("saved_at", { ascending: false })
          .limit(5);

        if (!saved || saved.length === 0) return;

        const { data: recipes } = await supabase
          .from("recipes")
          .select("id, hero_image_url, steps")
          .in("id", saved.map((s) => s.recipe_id));

        if (!recipes) return;

        const registration = await navigator.serviceWorker.ready;

        for (const recipe of recipes) {
          const urls: string[] = [`/recipes/${recipe.id}`];
          if (recipe.hero_image_url) urls.push(recipe.hero_image_url);

          const steps = recipe.steps as Array<{ body: string; image_url?: string }>;
          if (Array.isArray(steps)) {
            for (const step of steps) {
              if (step.image_url) urls.push(step.image_url);
            }
          }

          registration.active?.postMessage({ type: "CACHE_RECIPE", urls });

          if (Array.isArray(steps)) {
            for (const step of steps) {
              if (step.body) {
                registration.active?.postMessage({
                  type: "CACHE_TTS",
                  text: step.body,
                  url: "/api/tts",
                });
              }
            }
          }
        }
      } catch {}
    };

    const timer = setTimeout(precache, 5000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
