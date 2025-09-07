import { Link } from 'react-router-dom'
import { ArrowRight, Play, Film, Clock, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MovieGrid from '@/components/movies/MovieGrid'
import { useMovies } from '@/hooks/useMovies'

export default function HomePage() {
  const { data: movies = [], isLoading } = useMovies()
  
  // Get first 8 movies for preview
  const previewMovies = movies.slice(0, 8)
  
  // Get some quick stats
  const totalMovies = movies.length
  const recentMovies = movies.filter(movie => {
    const addedDate = new Date(movie.added_date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return addedDate > weekAgo
  }).length

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section 
        className="flex flex-col items-center justify-center text-center py-12 md:py-20 -mx-4 md:-mx-6 px-4 relative bg-cover bg-center bg-no-repeat min-h-[500px] md:min-h-[600px]"
        // style={{ backgroundImage: 'url(/bg.png)' }}
      >
        {/* Background overlay for better text readability */}
        <div className="absolute inset-0 bg-background/60" />
        
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 relative z-10">
          {/* Logo Animation */}
          <div className="flex items-center justify-center mb-6 md:mb-8">
            <img 
              src="/SneakFlix_logo.png" 
              alt="SneakFlix" 
              className="h-32 w-32 object-contain sneakflix-logo"
              style={{ height: '8rem', width: '8rem' }}
            />
          </div>
          
          {/* Welcome Text */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold gradient-text mb-4 md:mb-6">
            Welcome to SneakFlix
          </h1>
          
          {/* Descriptive Text */}
          <p className="text-base md:text-xl text-muted-foreground max-w-3xl leading-relaxed mb-6 md:mb-8">
            Your personal cinema at home. Stream your favorite movies seamlessly across all your devices 
            with our beautiful, modern interface designed for the ultimate viewing experience.
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-6 md:mt-8">
            <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
              <Film className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <span className="font-medium">{totalMovies} Movies</span>
            </div>
            <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <span className="font-medium">{recentMovies} Added This Week</span>
            </div>
            <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <span className="font-medium">HD Quality</span>
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mt-8 md:mt-12">
            <Link to="/movies" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto flex items-center justify-center gap-2 text-base md:text-lg px-6 md:px-8 py-4 md:py-6">
                <Play className="h-4 w-4 md:h-5 md:w-5" />
                Start Watching
              </Button>
            </Link>
            <Link to="/movies?filter=recent" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto flex items-center justify-center gap-2 text-base md:text-lg px-6 md:px-8 py-4 md:py-6">
                <Clock className="h-4 w-4 md:h-5 md:w-5" />
                Browse Recent
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Movies Preview Section */}
      {totalMovies > 0 && (
        <section className="space-y-8">
          {/* Section Header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text">
              Available Movies
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Discover your collection of carefully curated movies, ready to stream instantly
            </p>
          </div>
          
          {/* Movies Grid Preview */}
          <div className="space-y-8">
            <MovieGrid 
              movies={previewMovies} 
              isLoading={isLoading}
              className="animate-fade-in"
            />
            
            {/* See All Button */}
            <div className="flex justify-center">
              <Link to="/movies">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="flex items-center gap-2 text-lg px-8 py-4 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  See All Movies
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {totalMovies === 0 && !isLoading && (
        <section className="flex flex-col items-center justify-center text-center py-20">
          <div className="text-8xl mb-6 opacity-50">🎭</div>
          <h3 className="text-2xl font-semibold text-foreground mb-4">No Movies Found</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Your movie library is empty. Add some movies to your media directory and scan to get started.
          </p>
          <Link to="/settings">
            <Button size="lg" className="flex items-center gap-2">
              <Film className="h-5 w-5" />
              Configure Media Directory
            </Button>
          </Link>
        </section>
      )}
    </div>
  )
}