import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NotificationsClient from "./notifications-client";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, title, body, read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <NotificationsClient notifications={notifications || []} />;
}
