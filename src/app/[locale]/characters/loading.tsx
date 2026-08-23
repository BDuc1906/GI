export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="h-8 w-48 rounded-lg bg-bg-elevated animate-pulse mb-8" />
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-[var(--radius-card)] bg-bg-elevated animate-pulse" />
        ))}
      </div>
    </div>
  );
}
