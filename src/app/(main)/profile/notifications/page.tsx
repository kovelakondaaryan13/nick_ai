"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function NotifPrefsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [prefs, setPrefs] = useState({ suggestions: true, reminders: true, system: true });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("notif_prefs")
        .eq("user_id", user.id)
        .single();
      if (data?.notif_prefs) setPrefs({ ...prefs, ...data.notif_prefs });
    })();
  }, [supabase]);

  const toggle = async (key: keyof typeof prefs) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ notif_prefs: updated }).eq("user_id", user.id);
    }
  };

  return (
    <div className="px-4 pt-12 pb-4 bg-white min-h-screen">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1" aria-label="Go back">
          <ArrowLeft className="h-5 w-5 text-[#111111]" />
        </button>
        <h1 className="text-lg font-bold text-[#111111] font-[family-name:var(--font-playfair)]">Notifications</h1>
      </div>

      <div className="mt-6 divide-y divide-[#E5E7EB] rounded-xl border border-[#E5E7EB] bg-[#F8F9FA]">
        {([
          { key: "suggestions" as const, label: "Recipe suggestions", desc: "Daily dinner ideas from Nick" },
          { key: "reminders" as const, label: "Meal reminders", desc: "Nudges to cook at your usual time" },
          { key: "system" as const, label: "System updates", desc: "New features and improvements" },
        ]).map((item) => (
          <label key={item.key} className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p className="text-sm font-medium text-[#111111]">{item.label}</p>
              <p className="text-xs text-[#6B7280]">{item.desc}</p>
            </div>
            <input
              type="checkbox"
              checked={prefs[item.key]}
              onChange={() => toggle(item.key)}
              className="h-5 w-5 accent-[#2563EB]"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
