"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChefHat, Clock, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
}

const FILTERS = ["All", "Nick", "Reminders"];
const TYPE_ICONS: Record<string, typeof ChefHat> = {
  suggestion: ChefHat,
  reminder: Clock,
  system: Info,
};

export default function NotificationsClient({
  notifications: initial,
}: {
  notifications: Notification[];
}) {
  const [notifications, setNotifications] = useState(initial);
  const [filter, setFilter] = useState("All");
  const router = useRouter();
  const supabase = createClient();

  const filtered =
    filter === "All"
      ? notifications
      : filter === "Nick"
        ? notifications.filter((n) => n.type === "suggestion")
        : notifications.filter((n) => n.type === "reminder");

  const markRead = async (notif: Notification) => {
    if (!notif.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
      const { error } = await supabase.from("notifications").update({ read: true }).eq("id", notif.id);
      if (error) toast.error("Couldn't update notification.");
    }

    if (notif.body) {
      try {
        const parsed = JSON.parse(notif.body);
        if (parsed.recipe_ids?.[0]) {
          router.push(`/recipes/${parsed.recipe_ids[0]}`);
          return;
        }
      } catch {}
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  if (notifications.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <Bell className="mb-4 h-12 w-12 text-[#6B7280]" />
        <h2 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-[#111111]">No notifications</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Nick will let you know when he has ideas.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-12 pb-4">
      <h1 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#111111]">Notifications</h1>

      <div className="mt-3 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              filter === f
                ? "border-[#FF6B35] bg-[#2563EB] text-white"
                : "border-[#E5E7EB] text-[#111111]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {filtered.map((notif) => {
          const Icon = TYPE_ICONS[notif.type] || Bell;
          return (
            <button
              key={notif.id}
              onClick={() => markRead(notif)}
              className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left ${
                notif.read
                  ? "border-[#E5E7EB] bg-[#F3F4F6]"
                  : "border-[#E5E7EB] bg-[#F8F9FA]"
              }`}
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#2563EB]">
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm text-[#111111] ${notif.read ? "" : "font-semibold"}`}>
                    {notif.title}
                  </p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[10px] text-[#6B7280]">{timeAgo(notif.created_at)}</span>
                    {!notif.read && <span className="h-2 w-2 rounded-full bg-[#2563EB]" />}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-[#6B7280]">that&apos;s everything for now</p>
    </div>
  );
}
