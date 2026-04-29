import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { embed } from "@/lib/openai";
import { searchRecipes } from "@/lib/qdrant";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: users } = await supabase
    .from("profiles")
    .select("user_id, taste_fingerprint, dietary_flags, notif_prefs")
    .eq("onboarding_complete", true);

  if (!users || users.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  let processed = 0;

  for (const user of users) {
    if (user.notif_prefs?.suggestions === false) continue;

    const fingerprint = user.taste_fingerprint?.join(" ") || "comfort food dinner";
    const vector = await embed(fingerprint);

    const results = await searchRecipes(vector, 3);
    const recipeIds = results.map((r) => r.id as string);

    if (recipeIds.length === 0) continue;

    await supabase.from("notifications").insert({
      user_id: user.user_id,
      type: "suggestion",
      title: `Nick has ${recipeIds.length} dinner ideas for tonight`,
      body: JSON.stringify({ recipe_ids: recipeIds }),
      read: false,
    });

    processed++;
  }

  return NextResponse.json({ processed });
}
