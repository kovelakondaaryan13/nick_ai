"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function EditProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ display_name: name.trim(), avatar_initial: name.trim()[0].toUpperCase() })
        .eq("user_id", user.id);
    }
    router.back();
    router.refresh();
  };

  return (
    <div className="px-4 pt-12 bg-[#0F0F0F] min-h-screen">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1" aria-label="Go back">
          <ArrowLeft className="h-5 w-5 text-[#F5F0E8]" />
        </button>
        <h1 className="text-lg font-bold text-[#F5F0E8] font-[family-name:var(--font-playfair)]">Edit Profile</h1>
      </div>

      <div className="mt-6">
        <label className="text-xs font-medium text-[#9A9A8A]">Display name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="mt-1 h-12 w-full rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-4 text-sm text-[#F5F0E8] placeholder-[#9A9A8A] outline-none focus:border-[#FF6B35]"
        />
      </div>

      <button
        onClick={save}
        disabled={!name.trim() || saving}
        className="mt-6 w-full rounded-full bg-[#FF6B35] py-3 text-sm font-semibold text-white disabled:opacity-40"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
