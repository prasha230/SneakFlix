import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { SidebarProvider } from '@/contexts/SidebarContext'
import Layout from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
import AllMoviesPage from '@/pages/AllMoviesPage'
import SearchResultsPage from '@/pages/SearchResultsPage'
import MoviePage from '@/pages/MoviePage'
import SettingsPage from '@/pages/SettingsPage'
import NotFoundPage from '@/pages/NotFoundPage'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SidebarProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movies" element={<AllMoviesPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/movie/:id" element={<MoviePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </SidebarProvider>
      <Toaster />
    </div>
  )
}

export default App
