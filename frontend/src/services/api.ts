import { Movie, MovieSearchParams, ScanResult, ServerInfo } from '@/types/movie'

const API_BASE = '/api'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new ApiError(response.status, `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const movieApi = {
  // Get all movies
  getMovies: (): Promise<Movie[]> => 
    fetchApi('/movies'),

  // Get movie by ID
  getMovie: (id: number): Promise<Movie> => 
    fetchApi(`/movies/${id}`),

  // Search movies
  searchMovies: (params: MovieSearchParams): Promise<Movie[]> => {
    const searchParams = new URLSearchParams()
    if (params.query) searchParams.set('q', params.query)
    if (params.genre) searchParams.set('genre', params.genre)
    if (params.year) searchParams.set('year', params.year.toString())
    if (params.resolution) searchParams.set('resolution', params.resolution)
    if (params.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
    
    const query = searchParams.toString()
    return fetchApi(`/movies/search${query ? `?${query}` : ''}`)
  },

  // Get streaming URL for movie
  getStreamUrl: (id: number): string => 
    `${API_BASE}/stream/${id}`,

  // Get thumbnail URL for movie
  getThumbnailUrl: (id: number): string => 
    `${API_BASE}/thumbnail/${id}`,

  // Get subtitle URL for movie
  getSubtitleUrl: (id: number, filename: string): string => 
    `${API_BASE}/subtitles/${id}/${encodeURIComponent(filename)}`,

  // Scan media directory
  scanMedia: (): Promise<ScanResult> => 
    fetchApi('/scan', { method: 'POST' }),

  // Get server info
  getServerInfo: (): Promise<ServerInfo> => 
    fetchApi('/info'),

  // Update watch stats
  updateWatchStats: (id: number): Promise<void> => 
    fetchApi(`/movies/${id}/watch`, { method: 'POST' }),

  // Update media path
  updateMediaPath: (mediaPath: string): Promise<{ success: boolean; message: string; newPath: string }> => 
    fetchApi('/settings/media-path', { 
      method: 'POST',
      body: JSON.stringify({ mediaPath })
    }),
}

export { ApiError }
