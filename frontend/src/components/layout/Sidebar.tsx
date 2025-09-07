import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Film, Settings, TrendingUp, Clock, Star, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useSidebar } from '@/contexts/SidebarContext'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'All Movies', href: '/movies', icon: Film },
  { name: 'Recently Added', href: '/movies?filter=recent', icon: Clock },
  { name: 'Popular', href: '/movies?filter=popular', icon: TrendingUp },
  { name: 'Favorites', href: '/movies?filter=favorites', icon: Star },
]

const bottomNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const location = useLocation()
  const { isCollapsed, setIsCollapsed } = useSidebar()

  // Disable body scroll when sidebar is open on mobile
  useEffect(() => {
    const handleScrollLock = () => {
      const isMobile = window.innerWidth < 768
      
      if (isMobile && !isCollapsed) {
        // Store current scroll position
        const scrollY = window.scrollY
        
        // Disable scroll
        document.body.style.overflow = 'hidden'
        document.body.style.position = 'fixed'
        document.body.style.top = `-${scrollY}px`
        document.body.style.width = '100%'
        
        // Store scroll position for restoration
        document.body.dataset.scrollY = scrollY.toString()
      } else {
        // Re-enable scroll and restore position
        const scrollY = document.body.dataset.scrollY
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY))
          delete document.body.dataset.scrollY
        }
      }
    }

    handleScrollLock()

    // Listen for resize events to handle orientation changes
    const handleResize = () => {
      // If we're now on desktop and sidebar is open, ensure scroll is enabled
      if (window.innerWidth >= 768) {
        const scrollY = document.body.dataset.scrollY
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY))
          delete document.body.dataset.scrollY
        }
      } else {
        handleScrollLock()
      }
    }

    window.addEventListener('resize', handleResize)

    // Cleanup function to re-enable scroll when component unmounts
    return () => {
      window.removeEventListener('resize', handleResize)
      
      const scrollY = document.body.dataset.scrollY
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY))
        delete document.body.dataset.scrollY
      }
    }
  }, [isCollapsed])

  const NavLink = ({ item, isActive }: { item: any, isActive: boolean }) => {
    const linkContent = (
      <Link
        to={item.href}
        onClick={() => {
          // Close sidebar on mobile when clicking a link
          if (window.innerWidth < 768) {
            setIsCollapsed(true)
          }
          // Scroll to top when navigating
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
          isActive 
            ? 'bg-accent text-accent-foreground' 
            : 'text-muted-foreground',
          isCollapsed && 'justify-center px-2 md:px-2'
        )}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        {!isCollapsed && item.name}
      </Link>
    )

    if (isCollapsed && window.innerWidth >= 768) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.name}</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    return linkContent
  }

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      <TooltipProvider>
        <aside className={cn(
          "fixed left-0 top-16 bottom-0 z-40 border-r border-border/40 bg-card transition-all duration-300",
          // Mobile: full width when open, hidden when closed
          // Desktop: normal sidebar behavior
          "md:bg-card/50",
          isCollapsed 
            ? "w-0 md:w-16 -translate-x-full md:translate-x-0" 
            : "w-64 translate-x-0"
        )}>
        <div className="flex h-full flex-col overflow-hidden">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between p-4 md:hidden border-b border-border/40">
            <span className="text-lg font-bold gradient-text">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                let isActive = false
                
                if (item.href.includes('?')) {
                  // For filtered routes, match both path and query
                  const [path, query] = item.href.split('?')
                  isActive = location.pathname === path && location.search === `?${query}`
                } else {
                  // For simple routes, match exact path and no query params
                  isActive = location.pathname === item.href && !location.search
                }
                
                return (
                  <NavLink
                    key={item.name}
                    item={item}
                    isActive={isActive}
                  />
                )
              })}
            </div>
          </nav>

          {/* Bottom Navigation with Collapse Button */}
          <div className="border-t border-border/40 p-4">
            {isCollapsed ? (
              // Vertical layout when collapsed (desktop only)
              <div className="space-y-2 hidden md:block">
                {bottomNavigation.map((item) => {
                  const isActive = location.pathname === item.href
                  
                  return (
                    <NavLink
                      key={item.name}
                      item={item}
                      isActive={isActive}
                    />
                  )
                })}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="w-full h-8 justify-center"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              // Horizontal layout when expanded
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  {bottomNavigation.map((item) => {
                    const isActive = location.pathname === item.href
                    
                    return (
                      <NavLink
                        key={item.name}
                        item={item}
                        isActive={isActive}
                      />
                    )
                  })}
                </div>
                {/* Hide collapse button on mobile */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="h-8 w-8 flex-shrink-0 hidden md:flex"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>
      </TooltipProvider>
    </>
  )
}
