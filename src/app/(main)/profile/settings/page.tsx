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
    <div className="px-4 pt-12 pb-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1" aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">Settings</h1>
      </div>

      <div className="mt-6 divide-y divide-[#ECECEC] rounded-xl border border-[#ECECEC] bg-white">
        <div className="flex items-center justify-between px-4 py-3.5">
          <div>
            <p className="text-sm font-medium">Theme</p>
            <p className="text-xs text-[#6B6B6B]">Light (dark mode coming soon)</p>
          </div>
        </div>
      </div>

      <button
        onClick={signOut}
        className="mt-6 w-full rounded-full border border-[#ECECEC] py-3 text-sm font-medium text-red-500"
      >
        Sign out
      </button>

      <p className="mt-4 text-center text-[10px] text-[#A0A0A0]">
        Nick AI v1.0.0 · alpha
      </p>
    </div>
  );
}
