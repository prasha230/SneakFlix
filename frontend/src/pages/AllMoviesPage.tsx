import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MovieGrid from '@/components/movies/MovieGrid'
import { useMovies } from '@/hooks/useMovies'
import { FilterOption, ViewMode } from '@/types/movie'

export default function AllMoviesPage() {
  const [searchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const { data: movies = [], isLoading, error } = useMovies()
  
  const filter = (searchParams.get('filter') as FilterOption) || 'all'

  // Filter movies based on current filter
  const filteredMovies = useMemo(() => {
    switch (filter) {
      case 'recent':
        return [...movies].sort((a, b) => 
          new Date(b.added_date).getTime() - new Date(a.added_date).getTime()
        )
      case 'popular':
        return [...movies].sort((a, b) => b.watch_count - a.watch_count)
      case 'unwatched':
        return movies.filter(movie => movie.watch_count === 0)
      case 'favorites':
        // This would require a favorites system to be implemented
        return movies.filter(movie => movie.watch_count > 0)
      default:
        return movies
    }
  }, [movies, filter])

  const getPageTitle = () => {
    switch (filter) {
      case 'recent': return 'Recently Added'
      case 'popular': return 'Popular Movies'
      case 'unwatched': return 'Unwatched Movies'
      case 'favorites': return 'Your Favorites'
      default: return 'All Movies'
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-6xl mb-4 opacity-50">⚠️</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Something went wrong</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Unable to load movies. Please check your connection and try again.
        </p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">{getPageTitle()}</h1>
          <p className="text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : `${filteredMovies.length} movies`}
          </p>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      {!isLoading && movies.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-effect rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">{movies.length}</div>
            <div className="text-sm text-muted-foreground">Total Movies</div>
          </div>
          <div className="glass-effect rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">
              {movies.filter(m => m.watch_count > 0).length}
            </div>
            <div className="text-sm text-muted-foreground">Watched</div>
          </div>
          <div className="glass-effect rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">
              {new Set(movies.map(m => m.year).filter(Boolean)).size}
            </div>
            <div className="text-sm text-muted-foreground">Years</div>
          </div>
          <div className="glass-effect rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">
              {Math.round(movies.reduce((acc, m) => acc + m.file_size, 0) / (1024 ** 3))}GB
            </div>
            <div className="text-sm text-muted-foreground">Total Size</div>
          </div>
        </div>
      )}

      {/* Movies Grid */}
      <MovieGrid 
        movies={filteredMovies} 
        isLoading={isLoading}
        className="animate-fade-in"
      />
    </div>
  )
}
