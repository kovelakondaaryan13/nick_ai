"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const TOOLS = [
  "Oven", "Stovetop", "Air fryer", "Blender", "Stand mixer",
  "Food processor", "Instant Pot", "Sous vide", "Grill", "Cast iron skillet",
  "Dutch oven", "Wok", "Sheet pans", "Microwave", "Toaster oven",
];

export default function ToolsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("kitchen_tools")
        .eq("user_id", user.id)
        .single();
      if (data?.kitchen_tools) setSelected(data.kitchen_tools);
    })();
  }, [supabase]);

  const toggle = async (tool: string) => {
    const updated = selected.includes(tool)
      ? selected.filter((t) => t !== tool)
      : [...selected, tool];
    setSelected(updated);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ kitchen_tools: updated }).eq("user_id", user.id);
    }
  };

  return (
    <div className="px-4 pt-12 pb-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">Kitchen Tools</h1>
      </div>

      <div className="mt-6 divide-y divide-[#ECECEC] rounded-xl border border-[#ECECEC] bg-white">
        {TOOLS.map((tool) => (
          <button
            key={tool}
            onClick={() => toggle(tool)}
            className="flex w-full items-center justify-between px-4 py-3"
          >
            <span className="text-sm">{tool}</span>
            {selected.includes(tool) && <Check className="h-4 w-4 text-[#1A1A1A]" />}
          </button>
        ))}
      </div>
    </div>
  );
}
