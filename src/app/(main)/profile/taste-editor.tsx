"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const ALL_FLAVORS = ["spicy", "sweet", "umami", "bitter", "sour", "smoky", "herby", "rich"];

export default function ProfileTasteEditor({ current }: { current: string[] }) {
  const [flavors, setFlavors] = useState<string[]>(current);
  const [showPicker, setShowPicker] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const save = async (updated: string[]) => {
    const prev = flavors;
    setFlavors(updated);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("profiles")
        .update({ taste_fingerprint: updated })
        .eq("user_id", user.id);
      if (error) throw error;
      router.refresh();
    } catch {
      setFlavors(prev);
      toast.error("Couldn't save. Try again.");
    }
  };

  const remove = (flavor: string) => {
    save(flavors.filter((f) => f !== flavor));
  };

  const add = (flavor: string) => {
    save([...flavors, flavor]);
    setShowPicker(false);
  };

  const available = ALL_FLAVORS.filter((f) => !flavors.includes(f));

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {flavors.map((f) => (
          <button
            key={f}
            onClick={() => remove(f)}
            className="flex items-center gap-1 rounded-full bg-[#1A1A1A] px-3 py-1.5 text-xs font-medium capitalize text-white"
          >
            {f}
            <X className="h-3 w-3" />
          </button>
        ))}
        {available.length > 0 && (
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-1 rounded-full border border-dashed border-[#D0D0D0] px-3 py-1.5 text-xs font-medium text-[#6B6B6B]"
          >
            <Plus className="h-3 w-3" />
            add
          </button>
        )}
      </div>
      {showPicker && (
        <div className="mt-2 flex flex-wrap gap-2">
          {available.map((f) => (
            <button
              key={f}
              onClick={() => add(f)}
              className="rounded-full border border-[#D0D0D0] px-3 py-1.5 text-xs font-medium capitalize text-[#111111]"
            >
              {f}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
