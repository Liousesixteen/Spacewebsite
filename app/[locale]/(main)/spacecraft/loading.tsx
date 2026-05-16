export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="h-8 w-32 bg-space-700 animate-pulse rounded mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-space-800 border border-space-600 rounded-xl overflow-hidden"
          >
            <div className="aspect-video bg-space-700 animate-pulse" />
            <div className="p-6 space-y-3">
              <div className="h-6 bg-space-700 animate-pulse rounded" />
              <div className="h-4 bg-space-700 animate-pulse rounded w-3/4" />
              <div className="h-4 bg-space-700 animate-pulse rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
