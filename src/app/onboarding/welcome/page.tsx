"use client";

import { useRouter } from "next/navigation";
import { ChefHat } from "lucide-react";

export default function Welcome() {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#FF6B35]">
        <ChefHat className="h-10 w-10 text-white" />
      </div>
      <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#F5F0E8]">Hi, I&apos;m Nick.</h1>
      <p className="mt-2 max-w-[280px] text-sm text-[#9A9A8A]">
        Let me learn about you so I can cook for you. This takes 30 seconds.
      </p>

      <div className="mt-auto flex w-full flex-col gap-3 pt-12">
        <button
          onClick={() => router.push("/onboarding/taste")}
          className="w-full rounded-lg bg-[#FF6B35] py-3.5 text-sm font-semibold text-white"
        >
          Let&apos;s go
        </button>
        <button
          onClick={() => {
            fetch("/api/onboarding/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ skip: true }),
            }).then(() => {
              router.push("/");
              router.refresh();
            });
          }}
          className="text-sm text-[#9A9A8A] underline"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
