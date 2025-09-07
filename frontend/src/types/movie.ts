export interface Movie {
  id: number
  title: string
  file_path: string
  file_size: number
  duration?: string
  resolution?: string
  format: string
  thumbnail?: string
  year?: number
  genre?: string
  description?: string
  subtitles?: string[] | string
  added_date: string
  last_watched?: string
  watch_count: number
}

export interface MovieSearchParams {
  query?: string
  genre?: string
  year?: number
  resolution?: string
  sortBy?: 'title' | 'year' | 'added_date' | 'watch_count'
  sortOrder?: 'asc' | 'desc'
}

export interface ScanResult {
  found: number
  added: number
  message: string
}

export interface ServerInfo {
  name: string
  version: string
  mediaPath: string
  serverTime: string
}

export type ViewMode = 'grid' | 'list'
export type FilterOption = 'all' | 'recent' | 'popular' | 'unwatched' | 'favorites'
