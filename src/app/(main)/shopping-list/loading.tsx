export default function ShoppingListLoading() {
  return (
    <div className="px-4 pt-12 pb-24 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-6 w-32 rounded bg-[#F3F4F6]" />
          <div className="h-3 w-20 rounded bg-[#F3F4F6]" />
        </div>
        <div className="h-8 w-8 rounded bg-[#F3F4F6]" />
      </div>
      <div className="mt-3 flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-7 w-16 rounded-full bg-[#F3F4F6]" />
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-10 rounded-lg bg-[#F3F4F6]" />
        ))}
      </div>
    </div>
  );
}
