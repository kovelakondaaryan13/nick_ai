import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profile, messages, sessions, scans, shopping, saved] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).single(),
    supabase.from("chat_messages").select("*").eq("user_id", user.id).order("created_at"),
    supabase.from("cook_sessions").select("*").eq("user_id", user.id).order("started_at"),
    supabase.from("fridge_scans").select("*").eq("user_id", user.id).order("scanned_at"),
    supabase.from("shopping_list_items").select("*").eq("user_id", user.id),
    supabase.from("saved_recipes").select("*").eq("user_id", user.id),
  ]);

  return NextResponse.json({
    exported_at: new Date().toISOString(),
    user_id: user.id,
    email: user.email,
    profile: profile.data,
    chat_messages: messages.data || [],
    cook_sessions: sessions.data || [],
    fridge_scans: scans.data || [],
    shopping_list: shopping.data || [],
    saved_recipes: saved.data || [],
  });
}
