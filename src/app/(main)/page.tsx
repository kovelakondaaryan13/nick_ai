import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import Link from "next/link";
import HomeClient from "./home-client";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "GOOD MORNING";
  if (hour < 17) return "GOOD AFTERNOON";
  return "GOOD EVENING";
}

const CATEGORIES = [
  { name: "Healthy", subtitle: "nutrient-dense", href: "/browse?category=healthy", icon: "🥬" },
  { name: "Snacks", subtitle: "quick bites", href: "/browse?category=snacks", icon: "🍿" },
  { name: "Gourmet", subtitle: "elevated", href: "/browse?category=gourmet", icon: "👨‍🍳" },
  { name: "Surprise", subtitle: "roll the dice", href: "/surprise", icon: "🎲" },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false);

  return (
    <div className="px-4 pt-12">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-playfair)] text-xl font-bold">Nick AI</h1>
        <Link href="/notifications" className="relative p-2" aria-label="Notifications">
          <Bell className="h-5 w-5 text-[#6B7280]" />
          {(unreadCount ?? 0) > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#2563EB]" />
          )}
        </Link>
      </div>

      <p className="mt-4 text-xs font-medium tracking-wider text-[#6B7280]">
        {getGreeting()} · pick tonight&apos;s plate
      </p>

      <Link
        href="/scan"
        className="mt-4 flex items-center gap-3 rounded-2xl bg-[#2563EB] p-4"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
          <span className="text-lg">📷</span>
        </div>
        <div>
          <p className="text-sm font-bold text-white">Scan your fridge</p>
          <p className="text-xs text-white/70">Let Nick see what you&apos;ve got</p>
        </div>
      </Link>

      <div className="mt-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">For You</h2>
        <HomeClient />
      </div>

      <div className="mt-8 pb-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Browse</h2>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="flex flex-col gap-1 rounded-2xl border border-[#E5E7EB] bg-[#F8F9FA] p-4 active:border-[#2563EB]"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-sm font-semibold text-[#111111]">{cat.name}</span>
              <span className="text-xs text-[#6B7280]">{cat.subtitle}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
