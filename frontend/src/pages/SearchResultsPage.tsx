import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import MovieGrid from '@/components/movies/MovieGrid'
import { useMovieSearch } from '@/hooks/useMovies'
import { ViewMode } from '@/types/movie'

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [localQuery, setLocalQuery] = useState('')
  
  const query = searchParams.get('q') || ''
  const year = searchParams.get('year') || ''
  const resolution = searchParams.get('resolution') || ''
  const sortBy = searchParams.get('sortBy') || 'title'
  const sortOrder = searchParams.get('sortOrder') || 'asc'

  // Initialize local query with URL parameter
  useEffect(() => {
    setLocalQuery(query)
  }, [query])

  const { data: movies = [], isLoading, error } = useMovieSearch({
    query,
    year: year ? parseInt(year) : undefined,
    resolution: resolution || undefined,
    sortBy: sortBy as any,
    sortOrder: sortOrder as 'asc' | 'desc'
  })

  const handleSearch = (newQuery: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (newQuery) {
      newParams.set('q', newQuery)
    } else {
      newParams.delete('q')
    }
    setSearchParams(newParams)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    setSearchParams(newParams)
  }

  const clearFilters = () => {
    const newParams = new URLSearchParams()
    if (query) newParams.set('q', query)
    setSearchParams(newParams)
  }

  const activeFilters = useMemo(() => {
    const filters: { key: string; value: string; label: string }[] = []
    if (year) filters.push({ key: 'year', value: year, label: `Year: ${year}` })
    if (resolution) filters.push({ key: 'resolution', value: resolution, label: `Resolution: ${resolution}` })
    if (sortBy !== 'title') filters.push({ key: 'sortBy', value: sortBy, label: `Sort: ${sortBy}` })
    if (sortOrder !== 'asc') filters.push({ key: 'sortOrder', value: sortOrder, label: 'Descending' })
    return filters
  }, [year, resolution, sortBy, sortOrder])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(localQuery)
    }
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Search Error</h1>
        <p className="text-muted-foreground">
          Failed to search movies. Please try again.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Search Results</h1>
            {query && (
              <p className="text-muted-foreground mt-1">
                {isLoading ? 'Searching...' : `${movies.length} results for "${query}"`}
              </p>
            )}
          </div>
          
          {/* View Mode Toggle */}
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search movies..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
          {localQuery !== query && (
            <Button
              size="sm"
              onClick={() => handleSearch(localQuery)}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
            >
              Search
            </Button>
          )}
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Filters:</span>
            {activeFilters.map((filter) => (
              <Badge
                key={filter.key}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleFilterChange(filter.key, '')}
              >
                {filter.label} ×
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterChange('resolution', resolution === '1080p' ? '' : '1080p')}
            className={resolution === '1080p' ? 'bg-primary text-primary-foreground' : ''}
          >
            1080p
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterChange('resolution', resolution === '4K' ? '' : '4K')}
            className={resolution === '4K' ? 'bg-primary text-primary-foreground' : ''}
          >
            4K
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterChange('sortBy', sortBy === 'year' ? 'title' : 'year')}
            className={sortBy === 'year' ? 'bg-primary text-primary-foreground' : ''}
          >
            By Year
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterChange('sortBy', sortBy === 'watch_count' ? 'title' : 'watch_count')}
            className={sortBy === 'watch_count' ? 'bg-primary text-primary-foreground' : ''}
          >
            Popular
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="min-h-[400px]">
        {!query ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Start Searching</h2>
            <p className="text-muted-foreground">
              Enter a movie title to find what you're looking for
            </p>
          </div>
        ) : isLoading ? (
          <MovieGrid movies={[]} isLoading={true} />
        ) : movies.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Results Found</h2>
            <p className="text-muted-foreground mb-4">
              No movies found for "{query}". Try adjusting your search terms or filters.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        ) : (
          <MovieGrid movies={movies} />
        )}
      </div>
    </div>
  )
}
