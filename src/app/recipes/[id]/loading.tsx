export default function RecipeLoading() {
  return (
    <div className="min-h-dvh animate-pulse">
      <div className="h-[240px] bg-[#F3F4F6]" />
      <div className="px-4 pt-4 space-y-4">
        <div className="h-6 w-3/4 rounded bg-[#F3F4F6]" />
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 flex-1 rounded-xl border border-[#E5E7EB]" />
          ))}
        </div>
        <div className="flex border-b border-[#E5E7EB] pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 flex-1 rounded bg-[#F3F4F6] mx-2" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 rounded bg-[#F3F4F6]" />
          ))}
        </div>
      </div>
    </div>
  );
}
