
export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-9 w-64 rounded bg-neutral-800/60 mb-3" />
      <div className="h-4 w-40 rounded bg-neutral-800/40 mb-8" />
      <div className="h-16 rounded-xl bg-neutral-900/40 border border-neutral-800 mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] rounded-xl bg-neutral-900/40 border border-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}
