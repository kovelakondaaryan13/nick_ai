import Link from "next/link";

interface Recipe {
  id: string;
  title: string;
  hero_image_url: string;
  time_minutes: number;
  kcal: number;
  tags: string[];
  difficulty: string;
}

export function HeroRecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link href={`/recipes/${recipe.id}`} className="block flex-shrink-0 snap-center">
      <div className="relative h-[220px] w-[300px] overflow-hidden rounded-2xl">
        <img
          src={recipe.hero_image_url}
          alt={recipe.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-[family-name:var(--font-playfair)] text-base font-semibold text-white">{recipe.title}</h3>
          <p className="mt-0.5 text-xs text-white/70">
            {recipe.time_minutes} min · {recipe.kcal} kcal
          </p>
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-[#2563EB] px-2.5 py-0.5 text-[10px] font-semibold text-white">
          {recipe.difficulty}
        </div>
      </div>
    </Link>
  );
}

export function RecipeRow({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] p-3"
    >
      <img
        src={recipe.hero_image_url}
        alt={recipe.title}
        className="h-16 w-16 rounded-lg object-cover"
      />
      <div className="flex-1">
        <h3 className="font-[family-name:var(--font-playfair)] text-sm font-semibold text-[#111111]">{recipe.title}</h3>
        <p className="mt-0.5 text-xs text-[#6B7280]">
          {recipe.time_minutes} min · {recipe.difficulty}
        </p>
      </div>
    </Link>
  );
}
