import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Sun, Moon, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SearchDropdown from '@/components/ui/search-dropdown'
// import { useMovieSearch } from '@/hooks/useMovies'
// import { movieApi } from '@/services/api'
// import { cn } from '@/lib/utils'
import { useTheme } from '@/contexts/ThemeContext'
import { useSidebar } from '@/contexts/SidebarContext'

export default function Header() {
  // const [isRefreshing, setIsRefreshing] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  // const { refetch: refetchMovies } = useMovieSearch({ query: '' })
  const { theme, toggleTheme } = useTheme()
  const { setIsCollapsed } = useSidebar()

  // const handleRefresh = async () => {
  //   setIsRefreshing(true)
  //   try {
  //     // First scan for new/updated movies
  //     await movieApi.scanMedia()
  //     // Then refresh the movie list
  //     refetchMovies()
  //   } catch (error) {
  //     console.error('Refresh failed:', error)
  //   } finally {
  //     setIsRefreshing(false)
  //   }
  // }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="md:hidden"
          title="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center">
            <img 
              src="/SneakFlix_logo.png" 
              alt="SneakFlix" 
              className="h-8 w-8 object-contain sneakflix-logo"
            />
          </div>
          <span className="text-lg md:text-xl font-bold gradient-text">SneakFlix</span>
        </Link>

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <SearchDropdown className="w-full" />
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1 md:space-x-2">
          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden"
            title="Search"
          >
            <Search className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="relative"
            title="Scan for new movies and refresh library"
          >
            <RefreshCw className={cn(
              "h-5 w-5 transition-transform",
              isRefreshing && "animate-spin"
            )} />
            {isRefreshing && (
              <div className="absolute inset-0 rounded-md bg-primary/20 animate-pulse" />
            )}
          </Button> */}
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="md:hidden absolute top-full left-0 right-0 z-40 bg-background border-b border-border shadow-lg">
          <div className="container px-4 py-3">
            <SearchDropdown 
              className="w-full" 
              onClose={() => setShowMobileSearch(false)}
            />
          </div>
        </div>
      )}
    </header>
  )
}
