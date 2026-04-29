import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const PROTEIN = /chicken|beef|salmon|prawn|shrimp|pork|lamb|fish|tofu/i;
const DAIRY = /milk|cheese|cream|yogurt|butter|crème/i;
const PANTRY = /salt|pepper|oil|sugar|flour|rice|pasta|sauce|vinegar|soy|honey|baking/i;

function categorize(name: string): string {
  if (PROTEIN.test(name)) return "protein";
  if (DAIRY.test(name)) return "dairy";
  if (PANTRY.test(name)) return "pantry";
  return "produce";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { items, recipe_id } = await request.json();

  const rows = items.map((item: { name: string; quantity: string; unit: string }) => ({
    user_id: user.id,
    source_recipe_id: recipe_id || null,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    category: categorize(item.name),
    checked: false,
  }));

  await supabase.from("shopping_list_items").insert(rows);

  return NextResponse.json({ ok: true, count: rows.length });
}
