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
    <div className="px-4 pt-12 bg-white min-h-screen">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1" aria-label="Go back">
          <ArrowLeft className="h-5 w-5 text-[#111111]" />
        </button>
        <h1 className="text-lg font-bold text-[#111111] font-[family-name:var(--font-playfair)]">Edit Profile</h1>
      </div>

      <div className="mt-6">
        <label className="text-xs font-medium text-[#6B7280]">Display name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="mt-1 h-12 w-full rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] px-4 text-sm text-[#111111] placeholder-[#6B7280] outline-none focus:border-[#2563EB]"
        />
      </div>

      <button
        onClick={save}
        disabled={!name.trim() || saving}
        className="mt-6 w-full rounded-full bg-[#2563EB] py-3 text-sm font-semibold text-white disabled:opacity-40"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
