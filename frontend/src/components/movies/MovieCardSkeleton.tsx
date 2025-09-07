export default function MovieCardSkeleton() {
  return (
    <div className="movie-card">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
        <div className="h-full w-full shimmer" />
      </div>
      
      <div className="p-4 space-y-2">
        <div className="h-4 shimmer rounded" />
        <div className="h-3 shimmer rounded w-3/4" />
        <div className="flex gap-2">
          <div className="h-3 shimmer rounded w-12" />
          <div className="h-3 shimmer rounded w-16" />
        </div>
      </div>
    </div>
  )
}
