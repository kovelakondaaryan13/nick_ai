export default function BrowseLoading() {
  return (
    <div className="px-4 pt-12 pb-4 animate-pulse">
      <div className="h-6 w-20 rounded bg-[#F3F4F6]" />
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-28 rounded-2xl border border-[#E5E7EB] bg-[#F3F4F6]" />
        ))}
      </div>
    </div>
  );
}
