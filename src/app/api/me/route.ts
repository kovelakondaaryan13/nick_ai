import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await supabase.from("chat_messages").delete().eq("user_id", user.id);
  await supabase.from("cook_sessions").delete().eq("user_id", user.id);
  await supabase.from("fridge_scans").delete().eq("user_id", user.id);
  await supabase.from("shopping_list_items").delete().eq("user_id", user.id);
  await supabase.from("notifications").delete().eq("user_id", user.id);
  await supabase.from("saved_recipes").delete().eq("user_id", user.id);
  await supabase.from("profiles").delete().eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}
