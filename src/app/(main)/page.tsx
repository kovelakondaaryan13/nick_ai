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
        <h1 className="text-lg font-bold">AI Chef</h1>
        <Link href="/notifications" className="relative p-2">
          <Bell className="h-5 w-5 text-[#6B6B6B]" />
          {(unreadCount ?? 0) > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Link>
      </div>

      <p className="mt-4 text-xs font-medium tracking-wider text-[#A0A0A0]">
        {getGreeting()} · pick tonight&apos;s plate
      </p>

      <Link
        href="/scan"
        className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-[#D0D0D0] p-4"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A1A1A]">
          <span className="text-lg">📷</span>
        </div>
        <div>
          <p className="text-sm font-semibold">Scan your fridge</p>
          <p className="text-xs text-[#6B6B6B]">Let Nick see what you&apos;ve got</p>
        </div>
      </Link>

      <div className="mt-4">
        <h2 className="mb-3 text-sm font-semibold text-[#6B6B6B]">For You</h2>
        <HomeClient />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-[#6B6B6B]">Browse</h2>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="flex flex-col gap-1 rounded-2xl border border-[#ECECEC] p-4"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-sm font-semibold">{cat.name}</span>
              <span className="text-xs text-[#A0A0A0]">{cat.subtitle}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
