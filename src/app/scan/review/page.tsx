"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, ChefHat, Camera, AlertTriangle } from "lucide-react";

interface Ingredient {
  name: string;
  quantity: string | null;
  confidence: string;
}

export default function ScanReviewPage() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("scan_ingredients");
    if (stored) {
      setIngredients(JSON.parse(stored));
    } else {
      router.replace("/scan");
    }
  }, [router]);

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const addIngredient = () => {
    const name = newItem.trim();
    if (!name) return;
    setIngredients((prev) => [...prev, { name, quantity: null, confidence: "high" }]);
    setNewItem("");
  };

  const askNick = () => {
    const list = ingredients.map((i) => i.name).join(", ");
    const prompt = encodeURIComponent(
      `Nick, here's what I have: ${list}. What should I make?`
    );
    router.push(`/chat?prompt=${prompt}`);
  };

  if (ingredients.length === 0) return null;

  return (
    <div className="flex h-dvh flex-col bg-[#0F0F0F]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3">
        <button onClick={() => router.push("/")} className="p-1 text-[#F5F0E8]" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-[#F5F0E8]">Your ingredients</span>
        <div className="w-6" />
      </div>

      {/* Ingredient list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <p className="mb-3 text-xs text-[#9A9A8A]">
          {ingredients.length} ingredients detected · tap to remove
        </p>

        <div className="flex flex-wrap gap-2">
          {ingredients.map((item, i) => {
            const isLow = item.confidence === "low" || item.confidence === "medium";
            return (
              <button
                key={`${item.name}-${i}`}
                onClick={() => removeIngredient(i)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm ${
                  isLow
                    ? "border-amber-300 bg-amber-50 text-amber-800"
                    : "border-[#2A2A2A] bg-[#1A1A1A] text-[#F5F0E8]"
                }`}
              >
                {isLow && <AlertTriangle className="h-3 w-3" />}
                {item.name}
                {item.quantity && (
                  <span className="text-xs text-[#9A9A8A]">({item.quantity})</span>
                )}
                <X className="h-3 w-3 text-[#9A9A8A]" />
              </button>
            );
          })}
        </div>

        {/* Add ingredient */}
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addIngredient()}
            placeholder="Add ingredient..."
            className="h-10 flex-1 rounded-full border border-[#2A2A2A] bg-[#1A1A1A] px-4 text-sm text-[#F5F0E8] outline-none placeholder:text-[#9A9A8A] focus:border-[#FF6B35]"
          />
          <button
            onClick={addIngredient}
            disabled={!newItem.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF6B35] text-white disabled:opacity-40"
            aria-label="Add ingredient"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* CTAs */}
      <div className="border-t border-[#2A2A2A] bg-[#1A1A1A] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          onClick={askNick}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FF6B35] py-3.5 text-sm font-semibold text-white"
        >
          <ChefHat className="h-4 w-4" />
          Ask Nick what to make
        </button>
        <button
          onClick={() => {
            sessionStorage.removeItem("scan_ingredients");
            router.push("/scan");
          }}
          className="mt-2 flex w-full items-center justify-center gap-2 py-2 text-sm text-[#9A9A8A]"
        >
          <Camera className="h-4 w-4" />
          Scan again
        </button>
      </div>
    </div>
  );
}
