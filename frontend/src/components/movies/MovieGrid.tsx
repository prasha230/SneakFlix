import { Movie } from '@/types/movie'
import MovieCard from './MovieCard'
import MovieCardSkeleton from './MovieCardSkeleton'

interface MovieGridProps {
  movies: Movie[]
  isLoading?: boolean
  className?: string
}

export default function MovieGrid({ movies, isLoading, className }: MovieGridProps) {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 ${className}`}>
        {Array.from({ length: 10 }).map((_, index) => (
          <MovieCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-6xl mb-4 opacity-50">🎬</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No movies found</h3>
        <p className="text-muted-foreground max-w-md">
          Add some video files to your media directory and click "Scan Media" to get started.
        </p>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 ${className}`}>
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}
