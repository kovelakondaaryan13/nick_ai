export default function NotificationsLoading() {
  return (
    <div className="px-4 pt-12 pb-4 animate-pulse">
      <div className="h-6 w-32 rounded bg-[#F3F4F6]" />
      <div className="mt-3 flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-7 w-20 rounded-full bg-[#F3F4F6]" />
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-3 rounded-xl border border-[#E5E7EB] p-3">
            <div className="h-8 w-8 rounded-full bg-[#F3F4F6]" />
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
