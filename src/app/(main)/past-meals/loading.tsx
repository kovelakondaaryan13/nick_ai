export default function PastMealsLoading() {
  return (
    <div className="px-4 pt-12 pb-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 w-28 rounded bg-[#F3F4F6]" />
        <div className="h-8 w-8 rounded bg-[#F3F4F6]" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl border border-dashed border-[#E5E7EB]" />
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] p-3">
            <div className="h-16 w-16 rounded-lg bg-[#F3F4F6]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-[#F3F4F6]" />
              <div className="h-3 w-1/2 rounded bg-[#F3F4F6]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
