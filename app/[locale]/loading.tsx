export default function Loading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cosmic-blue mb-4" />
        <p className="text-star-dim">加载中...</p>
      </div>
    </div>
  );
}
