import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useState, useEffect } from 'react'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (!bytes) return 'Unknown size'
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Bytes'
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

export function formatDuration(seconds: number): string {
  if (!seconds) return 'Unknown'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export function getMovieYear(title: string): number | null {
  const yearMatch = title.match(/\((\d{4})\)/)
  return yearMatch ? parseInt(yearMatch[1]) : null
}

export function cleanMovieTitle(title: string): string {
  return title
    .replace(/\[.*?\]/g, '') // Remove [1080p], [BluRay], etc.
    .replace(/\((\d{4})\)/g, '') // Remove (2020)
    .replace(/\.(720p|1080p|4K|2160p)/gi, '')
    .replace(/\.(BluRay|BRRip|DVDRip|WEBRip|HDTV|HDRip)/gi, '')
    .replace(/\.(x264|x265|H264|H265)/gi, '')
    .replace(/[._-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Custom hook for debouncing values

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
