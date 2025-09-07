import { useEffect, useRef, useState } from 'react'
import { Movie } from '@/types/movie'
import { movieApi } from '@/services/api'

interface MoviePlayerProps {
  movie: Movie
  className?: string
}

export default function MoviePlayer({ movie, className }: MoviePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [subtitles, setSubtitles] = useState<string[]>([])

  useEffect(() => {
    // Parse subtitles from movie data
    let parsedSubtitles: string[] = []
    if (movie.subtitles) {
      parsedSubtitles = typeof movie.subtitles === 'string' 
        ? JSON.parse(movie.subtitles) 
        : movie.subtitles
    }
    setSubtitles(parsedSubtitles)
  }, [movie.subtitles])

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      // Set the video source directly (same as original vanilla JS approach)
      video.src = movieApi.getStreamUrl(movie.id)
      
      // Clear existing tracks
      const existingTracks = video.querySelectorAll('track')
      existingTracks.forEach(track => track.remove())
      
      // Add subtitle tracks
      subtitles.forEach((subtitleFile, index) => {
        const track = document.createElement('track')
        track.kind = 'subtitles'
        track.src = movieApi.getSubtitleUrl(movie.id, subtitleFile)
        
        // Extract language from filename if possible
        const lang = extractLanguageFromFilename(subtitleFile)
        track.srclang = lang.code
        track.label = lang.label
        
        // Set first track as default
        if (index === 0) {
          track.default = true
        }
        
        video.appendChild(track)
      })
      
      // Update watch stats when video starts playing
      const handlePlay = () => {
        movieApi.updateWatchStats(movie.id).catch(console.error)
      }

      video.addEventListener('play', handlePlay)
      
      return () => {
        video.removeEventListener('play', handlePlay)
        // Clean up video source
        video.src = ''
        // Clear tracks
        const tracks = video.querySelectorAll('track')
        tracks.forEach(track => track.remove())
      }
    }
  }, [movie.id, subtitles])

  return (
    <video
      ref={videoRef}
      controls
      crossOrigin="anonymous" // Required for subtitle CORS
      className={`w-full h-auto max-h-[70vh] rounded-lg ${className}`}
    >
      Your browser does not support the video tag.
    </video>
  )
}

// Helper function to extract language information from subtitle filename
function extractLanguageFromFilename(filename: string): { code: string; label: string } {
  const name = filename.toLowerCase()
  
  // Common language patterns in subtitle filenames
  const languageMap: { [key: string]: { code: string; label: string } } = {
    'en': { code: 'en', label: 'English' },
    'english': { code: 'en', label: 'English' },
    'es': { code: 'es', label: 'Spanish' },
    'spanish': { code: 'es', label: 'Spanish' },
    'fr': { code: 'fr', label: 'French' },
    'french': { code: 'fr', label: 'French' },
    'de': { code: 'de', label: 'German' },
    'german': { code: 'de', label: 'German' },
    'it': { code: 'it', label: 'Italian' },
    'italian': { code: 'it', label: 'Italian' },
    'pt': { code: 'pt', label: 'Portuguese' },
    'portuguese': { code: 'pt', label: 'Portuguese' },
    'ru': { code: 'ru', label: 'Russian' },
    'russian': { code: 'ru', label: 'Russian' },
    'ja': { code: 'ja', label: 'Japanese' },
    'japanese': { code: 'ja', label: 'Japanese' },
    'ko': { code: 'ko', label: 'Korean' },
    'korean': { code: 'ko', label: 'Korean' },
    'zh': { code: 'zh', label: 'Chinese' },
    'chinese': { code: 'zh', label: 'Chinese' },
    'ar': { code: 'ar', label: 'Arabic' },
    'arabic': { code: 'ar', label: 'Arabic' }
  }
  
  // Look for language indicators in filename
  for (const [pattern, lang] of Object.entries(languageMap)) {
    if (name.includes(pattern)) {
      return lang
    }
  }
  
  // Default to English if no language detected
  return { code: 'en', label: 'Subtitles' }
}
