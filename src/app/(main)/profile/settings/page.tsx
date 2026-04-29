"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
    router.refresh();
  };

  return (
    <div className="px-4 pt-12 pb-4 bg-[#0F0F0F] min-h-screen">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1" aria-label="Go back">
          <ArrowLeft className="h-5 w-5 text-[#F5F0E8]" />
        </button>
        <h1 className="text-lg font-bold text-[#F5F0E8] font-[family-name:var(--font-playfair)]">Settings</h1>
      </div>

      <div className="mt-6 divide-y divide-[#2A2A2A] rounded-xl border border-[#2A2A2A] bg-[#1A1A1A]">
        <div className="flex items-center justify-between px-4 py-3.5">
          <div>
            <p className="text-sm font-medium text-[#F5F0E8]">Theme</p>
            <p className="text-xs text-[#9A9A8A]">Dark</p>
          </div>
        </div>
      </div>

      <button
        onClick={signOut}
        className="mt-6 w-full rounded-full border border-[#2A2A2A] py-3 text-sm font-medium text-red-500"
      >
        Sign out
      </button>

      <p className="mt-4 text-center text-[10px] text-[#9A9A8A]">
        Nick AI v1.0.0 · alpha
      </p>
    </div>
  );
}
