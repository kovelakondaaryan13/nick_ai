"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Copy, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Item {
  id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
  category: string | null;
  checked: boolean;
  recipe_id: string | null;
}

const CATEGORIES = ["produce", "protein", "dairy", "pantry", "other"];
const CATEGORY_ICONS: Record<string, string> = {
  produce: "🥬",
  protein: "🥩",
  dairy: "🧀",
  pantry: "🫙",
  other: "📦",
};

const FILTER_OPTIONS = ["All", "Produce", "Protein", "Dairy", "Pantry"];

export default function ShoppingListClient({ items: initial }: { items: Item[] }) {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState("All");
  const [newItems, setNewItems] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const filtered = filter === "All"
    ? items
    : items.filter((i) => i.category === filter.toLowerCase());

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    items: filtered.filter((i) => (i.category || "other") === cat),
  })).filter((g) => g.items.length > 0);

  const recipeCount = new Set(items.filter((i) => i.recipe_id).map((i) => i.recipe_id)).size;

  const toggleCheck = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const updated = !item.checked;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: updated } : i)));
    const { error } = await supabase.from("shopping_list_items").update({ checked: updated }).eq("id", id);
    if (error) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !updated } : i)));
      toast.error("Couldn't update item. Try again.");
    }
  };

  const addItem = async (category: string) => {
    const name = (newItems[category] || "").trim();
    if (!name) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("shopping_list_items")
      .insert({ user_id: user.id, name, category, checked: false })
      .select()
      .single();

    if (data) {
      setItems((prev) => [...prev, data]);
      setNewItems((prev) => ({ ...prev, [category]: "" }));
    } else {
      toast.error("Couldn't add item. Try again.");
    }
  };

  const syncToClipboard = () => {
    const unchecked = items.filter((i) => !i.checked);
    const text = unchecked.map((i) => `${i.name}${i.quantity ? ` (${i.quantity}${i.unit ? " " + i.unit : ""})` : ""}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[#D0D0D0]">
          <ShoppingCart className="h-6 w-6 text-[#A0A0A0]" />
        </div>
        <h2 className="text-lg font-semibold">Your list is empty</h2>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          Add ingredients from any recipe.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-12 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Shopping List</h1>
          <p className="text-xs text-[#6B6B6B]">
            {recipeCount} recipe{recipeCount !== 1 ? "s" : ""} · {items.length} items
          </p>
        </div>
        <button onClick={syncToClipboard} className="p-2">
          <Copy className="h-5 w-5 text-[#6B6B6B]" />
        </button>
      </div>

      {copied && (
        <div className="mt-2 rounded-lg bg-[#1A1A1A] px-3 py-2 text-xs text-white">
          Copied to clipboard. Paste into your reminders app.
        </div>
      )}

      {/* Filter chips */}
      <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${
              filter === f
                ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                : "border-[#D0D0D0] text-[#111111]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grouped items */}
      <div className="mt-4 space-y-5">
        {grouped.map((group) => (
          <div key={group.category}>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#A0A0A0]">
              {CATEGORY_ICONS[group.category]} {group.category}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left ${
                    item.checked ? "bg-[#F5F5F5]" : "bg-white"
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border ${
                      item.checked ? "border-[#1A1A1A] bg-[#1A1A1A]" : "border-[#D0D0D0]"
                    }`}
                  >
                    {item.checked && <span className="text-xs text-white">✓</span>}
                  </div>
                  <span className={`flex-1 text-sm ${item.checked ? "text-[#A0A0A0] line-through" : ""}`}>
                    {item.name}
                  </span>
                  {item.quantity && (
                    <span className="text-xs text-[#6B6B6B]">
                      {item.quantity}{item.unit ? ` ${item.unit}` : ""}
                    </span>
                  )}
                </button>
              ))}

              {/* Add item input */}
              <div className="flex gap-2 px-3 pt-1">
                <input
                  type="text"
                  value={newItems[group.category] || ""}
                  onChange={(e) => setNewItems((prev) => ({ ...prev, [group.category]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addItem(group.category)}
                  placeholder="Add item..."
                  className="h-8 flex-1 rounded-lg border border-dashed border-[#D0D0D0] bg-transparent px-3 text-xs outline-none placeholder:text-[#A0A0A0] focus:border-[#1A1A1A]"
                />
                <button
                  onClick={() => addItem(group.category)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1A1A1A] text-white"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
