import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, HardDrive, FileText, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MoviePlayer from '@/components/movies/MoviePlayer'
import { useMovie } from '@/hooks/useMovies'
import { formatFileSize } from '@/lib/utils'

export default function MoviePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: movie, isLoading, error } = useMovie(Number(id))

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 shimmer rounded" />
          <div className="h-8 w-64 shimmer rounded" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="aspect-video shimmer rounded-lg" />
          </div>
          <div className="space-y-4">
            <div className="h-6 shimmer rounded" />
            <div className="h-4 shimmer rounded w-3/4" />
            <div className="h-4 shimmer rounded w-1/2" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-6xl mb-4 opacity-50">🎬</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Movie not found</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-4">
          The movie you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate('/')}>
          Back to Movies
        </Button>
      </div>
    )
  }

  const subtitles = movie.subtitles 
    ? typeof movie.subtitles === 'string' 
      ? JSON.parse(movie.subtitles) 
      : movie.subtitles
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4 md:mb-0">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text line-clamp-2">{movie.title}</h1>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <MoviePlayer movie={movie} />
        </div>

        {/* Movie Details */}
        <div className="space-y-4 md:space-y-6">
          {/* Basic Info */}
          <div className="glass-effect rounded-lg p-4 md:p-6">
            <h3 className="font-semibold mb-4">Movie Information</h3>
            <div className="space-y-3">
              {movie.year && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{movie.year}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span>{formatFileSize(movie.file_size)}</span>
              </div>

              {movie.resolution && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-4 w-4 flex items-center justify-center">
                    <div className="h-2 w-3 border border-muted-foreground rounded-sm" />
                  </div>
                  <span>{movie.resolution}</span>
                </div>
              )}

              {movie.format && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{movie.format.toUpperCase()}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span>
                  {movie.watch_count === 0 
                    ? 'Not watched yet' 
                    : `Watched ${movie.watch_count} time${movie.watch_count !== 1 ? 's' : ''}`
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Subtitles */}
          {subtitles.length > 0 && (
            <div className="glass-effect rounded-lg p-4 md:p-6">
              <h3 className="font-semibold mb-4">Available Subtitles</h3>
              <div className="space-y-2">
                {subtitles.map((subtitle: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-yellow-500" />
                    <span>{subtitle}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {movie.description && (
            <div className="glass-effect rounded-lg p-4 md:p-6">
              <h3 className="font-semibold mb-4">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {movie.description}
              </p>
            </div>
          )}

          {/* File Info */}
          <div className="glass-effect rounded-lg p-4 md:p-6">
            <h3 className="font-semibold mb-4">File Details</h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-muted-foreground">Path:</span>
                <div className="font-mono bg-muted/50 p-2 rounded mt-1 break-all">
                  {movie.file_path}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Added:</span>
                <span className="ml-2">
                  {new Date(movie.added_date).toLocaleDateString()}
                </span>
              </div>
              {movie.last_watched && (
                <div>
                  <span className="text-muted-foreground">Last watched:</span>
                  <span className="ml-2">
                    {new Date(movie.last_watched).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
