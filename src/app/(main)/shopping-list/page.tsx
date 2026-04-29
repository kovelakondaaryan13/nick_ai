import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ShoppingListClient from "./shopping-list-client";

export default async function ShoppingListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  const { data: items } = await supabase
    .from("shopping_list_items")
    .select("id, name, quantity, unit, category, checked, recipe_id")
    .eq("user_id", user.id)
    .order("created_at");

  return <ShoppingListClient items={items || []} />;
}
