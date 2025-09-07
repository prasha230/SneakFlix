import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Clock, Film } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useMovieSearch } from '@/hooks/useMovies'
import { Movie } from '@/types/movie'
import { useDebounce } from '@/lib/utils'

interface SearchDropdownProps {
  placeholder?: string
  className?: string
  onClose?: () => void
}

export default function SearchDropdown({ 
  placeholder = "Search movies...", 
  className,
  onClose 
}: SearchDropdownProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Debounce search query to avoid too many API calls
  const debouncedQuery = useDebounce(query, 300)
  
  const { data: suggestions = [], isLoading } = useMovieSearch(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length >= 2 }
  )

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sneakflix-recent-searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse recent searches:', e)
      }
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' && query.trim()) {
        handleSearch(query.trim())
        return
      }
      return
    }

    const totalItems = (recentSearches.length > 0 && !debouncedQuery ? recentSearches.length : 0) + 
                      (suggestions.length > 0 ? Math.min(suggestions.length, 5) : 0) + 
                      (debouncedQuery ? 1 : 0) // "Search for..." option

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % totalItems)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSelection(selectedIndex)
        } else if (query.trim()) {
          handleSearch(query.trim())
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSelection = (index: number) => {
    let currentIndex = 0
    
    // Recent searches (shown when no query)
    if (!debouncedQuery && recentSearches.length > 0) {
      if (index < recentSearches.length) {
        const searchTerm = recentSearches[index]
        setQuery(searchTerm)
        handleSearch(searchTerm)
        return
      }
      currentIndex = recentSearches.length
    }
    
    // Movie suggestions
    if (suggestions.length > 0) {
      const suggestionIndex = index - currentIndex
      if (suggestionIndex < Math.min(suggestions.length, 5)) {
        const movie = suggestions[suggestionIndex]
        navigate(`/movie/${movie.id}`)
        addToRecentSearches(movie.title)
        closeSearch()
        return
      }
      currentIndex += Math.min(suggestions.length, 5)
    }
    
    // "Search for..." option
    if (debouncedQuery && index === currentIndex) {
      handleSearch(query.trim())
    }
  }

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return
    
    addToRecentSearches(searchTerm)
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`)
    closeSearch()
  }

  const addToRecentSearches = (searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('sneakflix-recent-searches', JSON.stringify(updated))
  }

  const removeRecentSearch = (searchTerm: string) => {
    const updated = recentSearches.filter(s => s !== searchTerm)
    setRecentSearches(updated)
    localStorage.setItem('sneakflix-recent-searches', JSON.stringify(updated))
  }

  const closeSearch = () => {
    setIsOpen(false)
    setSelectedIndex(-1)
    setQuery('')
    onClose?.()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setIsOpen(true)
    setSelectedIndex(-1)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  // Prepare dropdown items
  const dropdownItems: Array<{
    type: 'recent' | 'movie' | 'search'
    content: string | Movie
    index: number
  }> = []

  let currentIndex = 0

  // Add recent searches (only when no current query)
  if (!debouncedQuery && recentSearches.length > 0) {
    recentSearches.forEach((search) => {
      dropdownItems.push({
        type: 'recent',
        content: search,
        index: currentIndex++
      })
    })
  }

  // Add movie suggestions (limit to 5)
  if (suggestions.length > 0) {
    suggestions.slice(0, 5).forEach((movie) => {
      dropdownItems.push({
        type: 'movie',
        content: movie,
        index: currentIndex++
      })
    })
  }

  // Add "Search for..." option
  if (debouncedQuery) {
    dropdownItems.push({
      type: 'search',
      content: debouncedQuery,
      index: currentIndex++
    })
  }

  return (
    <div ref={dropdownRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0 focus:outline-none"
          autoComplete="off"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setQuery('')}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
          >
            ×
          </Button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (dropdownItems.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-96 overflow-y-auto">
          {isLoading && debouncedQuery ? (
            <div className="p-3 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : (
            <>
              {dropdownItems.map((item) => (
                <div
                  key={`${item.type}-${item.index}`}
                  className={cn(
                    "px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground border-b border-border/50 last:border-b-0",
                    selectedIndex === item.index && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleSelection(item.index)}
                >
                  {item.type === 'recent' && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item.content as string}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeRecentSearch(item.content as string)
                        }}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </Button>
                    </div>
                  )}
                  
                  {item.type === 'movie' && (
                    <div className="flex items-center space-x-3">
                      <Film className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium truncate">
                            {(item.content as Movie).title}
                          </span>
                          {(item.content as Movie).year && (
                            <Badge variant="secondary" className="text-xs">
                              {(item.content as Movie).year}
                            </Badge>
                          )}
                        </div>
                        {(item.content as Movie).resolution && (
                          <span className="text-xs text-muted-foreground">
                            {(item.content as Movie).resolution}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {item.type === 'search' && (
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Search for "<strong>{item.content as string}</strong>"
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
