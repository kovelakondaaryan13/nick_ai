"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, Dice5, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Recipe {
  id: string;
  title: string;
  hero_image_url: string;
  time_minutes: number;
  kcal: number;
  cuisine: string;
  tags: string[];
  difficulty: string;
}

export default function SurprisePage() {
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [spinning, setSpinning] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const shakeRef = useRef({ lastX: 0, lastY: 0, lastZ: 0, lastTime: 0 });

  const fetchRandom = useCallback(async () => {
    setSpinning(true);
    setFadeIn(false);

    try {
      const res = await fetch("/api/surprise");
      if (!res.ok) throw new Error();
      const data = await res.json();

      setTimeout(() => {
        setRecipe(data.recipe);
        setTotalRecipes(data.totalRecipes || 0);
        setSpinning(false);
        setTimeout(() => setFadeIn(true), 50);
      }, 700);
    } catch {
      setSpinning(false);
      toast.error("Couldn't load a recipe. Try again.");
    }
  }, []);

  useEffect(() => {
    fetchRandom();
  }, [fetchRandom]);

  // Shake-to-reroll
  useEffect(() => {
    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc?.x || !acc?.y || !acc?.z) return;

      const now = Date.now();
      const ref = shakeRef.current;
      const timeDiff = now - ref.lastTime;

      if (timeDiff < 200) return;

      const dx = acc.x - ref.lastX;
      const dy = acc.y - ref.lastY;
      const dz = acc.z - ref.lastZ;
      const magnitude = Math.sqrt(dx * dx + dy * dy + dz * dz);

      ref.lastX = acc.x;
      ref.lastY = acc.y;
      ref.lastZ = acc.z;
      ref.lastTime = now;

      if (magnitude > 25 && !spinning) {
        fetchRandom();
      }
    };

    const requestPermission = async () => {
      if (
        typeof DeviceMotionEvent !== "undefined" &&
        "requestPermission" in DeviceMotionEvent &&
        typeof (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission === "function"
      ) {
        try {
          const perm = await (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
          if (perm === "granted") {
            window.addEventListener("devicemotion", handleMotion);
          }
        } catch {}
      } else {
        window.addEventListener("devicemotion", handleMotion);
      }
    };

    requestPermission();
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [spinning, fetchRandom]);

  return (
    <div className="flex h-dvh flex-col bg-[#FAFAF7]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => router.push("/")} className="p-1" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold">Surprise me</span>
        <div className="w-6" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6">
        {/* Dice */}
        <div className={`mb-4 ${spinning ? "animate-spin" : ""}`} style={{ animationDuration: "700ms" }}>
          <Dice5 className="h-16 w-16 text-[#1A1A1A]" />
        </div>

        {spinning && (
          <p className="text-sm text-[#6B6B6B]">
            shaking {totalRecipes > 0 ? totalRecipes.toLocaleString() : "..."} ideas...
          </p>
        )}

        {/* Result card */}
        {recipe && !spinning && (
          <div
            className={`w-full max-w-sm transition-opacity duration-300 ${
              fadeIn ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
              <img
                src={recipe.hero_image_url}
                alt={recipe.title}
                className="h-48 w-full object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-bold">{recipe.title}</h2>
                <p className="mt-1 text-xs text-[#6B6B6B]">
                  {recipe.time_minutes} min · {recipe.kcal} kcal · {recipe.difficulty}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {recipe.cuisine && (
                    <span className="rounded-full border border-[#D0D0D0] px-2.5 py-0.5 text-[10px] font-medium">
                      {recipe.cuisine}
                    </span>
                  )}
                  {recipe.tags?.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#D0D0D0] px-2.5 py-0.5 text-[10px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={fetchRandom}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-dashed border-[#D0D0D0] py-3 text-sm font-medium text-[#111111]"
              >
                <RefreshCw className="h-4 w-4" />
                Re-roll
              </button>
              <Link
                href={`/recipes/${recipe.id}`}
                className="flex flex-1 items-center justify-center rounded-full bg-[#1A1A1A] py-3 text-sm font-semibold text-white"
              >
                Cook this
              </Link>
            </div>

            <p className="mt-3 text-center text-[10px] text-[#A0A0A0]">
              Shake your phone to re-roll
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
