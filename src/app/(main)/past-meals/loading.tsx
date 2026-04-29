export default function PastMealsLoading() {
  return (
    <div className="px-4 pt-12 pb-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 w-28 rounded bg-[#1A1A1A]" />
        <div className="h-8 w-8 rounded bg-[#1A1A1A]" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl border border-dashed border-[#2A2A2A]" />
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-[#2A2A2A] p-3">
            <div className="h-16 w-16 rounded-lg bg-[#1A1A1A]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-[#1A1A1A]" />
              <div className="h-3 w-1/2 rounded bg-[#1A1A1A]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
