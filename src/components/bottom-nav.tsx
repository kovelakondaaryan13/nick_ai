"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, LayoutGrid, User, ChefHat } from "lucide-react";

const tabs = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/past-meals", icon: Clock, label: "Past Meals" },
  { href: "/chat", icon: ChefHat, label: "Nick", fab: true },
  { href: "/browse", icon: LayoutGrid, label: "Browse" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 border-t border-[#2A2A2A] bg-[#1A1A1A] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-end justify-around px-2 pt-2">
        {tabs.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          if (tab.fab) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF6B35] shadow-lg shadow-[#FF6B35]/30"
              >
                <Icon className="h-6 w-6 text-white" />
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-0.5 pb-2 pt-1"
            >
              <Icon
                className={`h-5 w-5 ${active ? "text-[#FF6B35]" : "text-[#F5F0E8]/50"}`}
                strokeWidth={active ? 2.5 : 1.5}
              />
              <span
                className={`text-[10px] ${active ? "font-semibold text-[#FF6B35]" : "text-[#F5F0E8]/50"}`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
