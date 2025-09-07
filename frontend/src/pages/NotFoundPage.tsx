import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="text-8xl mb-8 opacity-50">🎬</div>
      
      <h1 className="text-4xl font-bold gradient-text mb-4">404</h1>
      
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        Page Not Found
      </h2>
      
      <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
        The page you're looking for doesn't exist. It might have been moved, 
        deleted, or you entered the wrong URL.
      </p>
      
      <Link to="/">
        <Button className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          Back to Home
        </Button>
      </Link>
    </div>
  )
}
