import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.rpc("delete_user_data", { p_user_id: user.id });

  if (error) {
    console.error("[DELETE /api/me] RPC failed:", error.message);
    return NextResponse.json({ error: "Account deletion failed. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
