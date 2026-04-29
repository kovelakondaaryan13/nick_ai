import { create } from "zustand";

interface OnboardingState {
  tasteFingerprint: string[];
  vegetarian: boolean;
  glutenFree: boolean;
  allergens: string[];
  kitchenTools: string[];
  toggleTaste: (flavor: string) => void;
  setVegetarian: (v: boolean) => void;
  setGlutenFree: (v: boolean) => void;
  toggleAllergen: (a: string) => void;
  toggleTool: (t: string) => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  tasteFingerprint: [],
  vegetarian: false,
  glutenFree: false,
  allergens: [],
  kitchenTools: [],
  toggleTaste: (flavor) =>
    set((s) => ({
      tasteFingerprint: s.tasteFingerprint.includes(flavor)
        ? s.tasteFingerprint.filter((f) => f !== flavor)
        : [...s.tasteFingerprint, flavor],
    })),
  setVegetarian: (v) => set({ vegetarian: v }),
  setGlutenFree: (v) => set({ glutenFree: v }),
  toggleAllergen: (a) =>
    set((s) => ({
      allergens: s.allergens.includes(a)
        ? s.allergens.filter((x) => x !== a)
        : [...s.allergens, a],
    })),
  toggleTool: (t) =>
    set((s) => ({
      kitchenTools: s.kitchenTools.includes(t)
        ? s.kitchenTools.filter((x) => x !== t)
        : [...s.kitchenTools, t],
    })),
}));
