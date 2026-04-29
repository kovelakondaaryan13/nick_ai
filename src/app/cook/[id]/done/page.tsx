"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Star } from "lucide-react";
import { toast } from "sonner";

export default function CookDonePage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    const res = await fetch("/api/cook/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipe_id: recipeId, rating }),
    });

    if (res.ok) {
      toast.success("Saved to Past Meals");
      router.push("/past-meals");
    } else {
      toast.error("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#0F0F0F] px-6 text-center">
      <div className="text-5xl">🎉</div>
      <h1 className="font-[family-name:var(--font-playfair)] mt-4 text-2xl font-bold text-[#F5F0E8]">Nice work!</h1>
      <p className="mt-2 text-sm text-[#9A9A8A]">How was it? Rate this cook.</p>

      <div className="mt-6 flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setRating(n)} aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}>
            <Star
              className={`h-10 w-10 ${n <= rating ? "fill-yellow-400 text-yellow-400" : "text-[#2A2A2A]"}`}
            />
          </button>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={rating === 0 || loading}
        className="mt-8 w-full rounded-lg bg-[#FF6B35] py-3.5 text-sm font-semibold text-white disabled:opacity-30"
      >
        {loading ? "Saving..." : "Save to Past Meals"}
      </button>

      <button
        onClick={() => router.push("/")}
        className="mt-3 text-sm text-[#9A9A8A] underline"
      >
        Skip
      </button>
    </div>
  );
}
