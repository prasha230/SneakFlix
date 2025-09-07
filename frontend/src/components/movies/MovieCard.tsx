import { Link } from 'react-router-dom'
import { Play, Calendar, HardDrive, FileText } from 'lucide-react'
import { Movie } from '@/types/movie'
import { formatFileSize } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface MovieCardProps {
  movie: Movie
  className?: string
}

export default function MovieCard({ movie, className }: MovieCardProps) {
  const subtitles = movie.subtitles 
    ? typeof movie.subtitles === 'string' 
      ? JSON.parse(movie.subtitles) 
      : movie.subtitles
    : []

  return (
    <Link
      to={`/movie/${movie.id}`}
      className={cn('movie-card block group', className)}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-gradient-to-br from-muted via-muted/80 to-muted/60">
        {/* Thumbnail placeholder */}
        <div className="flex h-full w-full items-center justify-center text-6xl text-muted-foreground/50">
          🎬
        </div>
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
          <div className="rounded-full bg-primary p-3">
            <Play className="h-6 w-6 text-primary-foreground fill-current" />
          </div>
        </div>

        {/* Quality badge */}
        {movie.resolution && (
          <div className="absolute top-2 right-2 rounded-md bg-black/80 px-2 py-1 text-xs font-medium text-white">
            {movie.resolution}
          </div>
        )}

        {/* Subtitle badge */}
        {subtitles.length > 0 && (
          <div className="absolute top-2 left-2 rounded-md bg-yellow-500/90 px-2 py-1 text-xs font-medium text-black flex items-center gap-1">
            <FileText className="h-3 w-3" />
            SUB
          </div>
        )}
      </div>

      {/* Movie Info */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {movie.title}
        </h3>
        
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {movie.year && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {movie.year}
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <HardDrive className="h-3 w-3" />
            {formatFileSize(movie.file_size)}
          </div>
          
          {movie.format && (
            <div className="rounded bg-muted px-2 py-1 font-medium">
              {movie.format}
            </div>
          )}
        </div>

        {movie.description && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
            {movie.description}
          </p>
        )}
      </div>
    </Link>
  )
}
