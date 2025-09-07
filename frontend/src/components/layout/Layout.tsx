import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { useSidebar } from '@/contexts/SidebarContext'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      <main className={cn(
        "transition-all duration-300",
        // On mobile: no left margin (sidebar is overlay)
        // On desktop: normal sidebar margins
        "ml-0 md:ml-16",
        !isCollapsed && "md:ml-64"
      )}>
        <div className="container mx-auto px-4 py-6 md:px-6 md:py-10">
          {children}
        </div>
      </main>
    </div>
  )
}
