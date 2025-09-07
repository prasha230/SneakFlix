import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { movieApi } from '@/services/api'
import { MovieSearchParams, Movie } from '@/types/movie'

export function useMovies() {
  return useQuery({
    queryKey: ['movies'],
    queryFn: movieApi.getMovies,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useMovie(id: number) {
  return useQuery({
    queryKey: ['movie', id],
    queryFn: () => movieApi.getMovie(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function useMovieSearch(
  params: MovieSearchParams,
  options?: Partial<UseQueryOptions<Movie[], Error>>
) {
  return useQuery({
    queryKey: ['movies', 'search', params],
    queryFn: () => movieApi.searchMovies(params),
    enabled: !!params.query || Object.keys(params).length > 1,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  })
}

export function useServerInfo() {
  return useQuery({
    queryKey: ['server-info'],
    queryFn: movieApi.getServerInfo,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}
