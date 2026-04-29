"use client";

import { usePathname } from "next/navigation";

const steps = ["/onboarding/welcome", "/onboarding/taste", "/onboarding/dietary", "/onboarding/tools"];

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentStep = steps.indexOf(pathname);

  return (
    <div className="flex min-h-dvh flex-col px-6 pb-8 pt-12">
      {/* Progress dots */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${
              i === currentStep ? "w-6 bg-[#1A1A1A]" : i < currentStep ? "w-2 bg-[#1A1A1A]" : "w-2 bg-[#ECECEC]"
            }`}
          />
        ))}
      </div>
      {children}
    </div>
  );
}
