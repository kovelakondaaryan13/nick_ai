export default function ProfileLoading() {
  return (
    <div className="px-4 pt-12 pb-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 w-16 rounded bg-[#1A1A1A]" />
        <div className="h-8 w-8 rounded bg-[#1A1A1A]" />
      </div>
      <div className="mt-6 flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-[#1A1A1A]" />
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-[#1A1A1A]" />
          <div className="h-3 w-24 rounded bg-[#1A1A1A]" />
        </div>
      </div>
      <div className="mt-6 space-y-2">
        <div className="h-3 w-28 rounded bg-[#1A1A1A]" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-16 rounded-full bg-[#1A1A1A]" />
          ))}
        </div>
      </div>
      <div className="mt-6 space-y-1 rounded-xl border border-[#2A2A2A]">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 border-b border-[#2A2A2A] last:border-0" />
        ))}
      </div>
    </div>
  );
}
