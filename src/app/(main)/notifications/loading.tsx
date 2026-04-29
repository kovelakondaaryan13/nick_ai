export default function NotificationsLoading() {
  return (
    <div className="px-4 pt-12 pb-4 animate-pulse">
      <div className="h-6 w-32 rounded bg-[#1A1A1A]" />
      <div className="mt-3 flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-7 w-20 rounded-full bg-[#1A1A1A]" />
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-3 rounded-xl border border-[#2A2A2A] p-3">
            <div className="h-8 w-8 rounded-full bg-[#1A1A1A]" />
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
