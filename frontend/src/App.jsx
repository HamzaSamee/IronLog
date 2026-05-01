import { BrowserRouter as Router, Routes, Route, NavLink, Link, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  UserButton, 
  useUser,
  useAuth
} from '@clerk/clerk-react'
import Dashboard from './pages/Dashboard.jsx'
import Goals from './pages/Goals.jsx'
import Heatmap from './pages/Heatmap.jsx'
import IntensityGraph from './pages/IntensityGraph.jsx'
import Videos from './pages/Videos.jsx'
import AICoach from './pages/AICoach.jsx'
import Progress from './pages/Progress.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import Social from './pages/Social.jsx'
import Nutrition from './pages/Nutrition.jsx'
import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { getHeatmap, getGoals, getMe } from './lib/api.js'
import { cn } from './lib/utils'

const queryClient = new QueryClient()

function AppContent() {
  const { user, isLoaded } = useUser()
  const { userId } = useAuth()
  const location = useLocation()
  
  // Also fetch from our DB to handle demo accounts correctly
  const { data: dbUser } = useQuery({
    queryKey: ['me', userId || localStorage.getItem('clerk-user-id')],
    queryFn: () => getMe(),
    enabled: !!(userId || localStorage.getItem('clerk-user-id'))
  })

  useEffect(() => {
    if (userId) {
      localStorage.setItem('clerk-user-id', userId)
      if (user) {
        localStorage.setItem('clerk-user-name', user.username || user.firstName || '')
        localStorage.setItem('clerk-user-email', user.emailAddresses?.[0]?.emailAddress || '')
      }
    } else {
      // Don't clear if it's a demo account
      const current = localStorage.getItem('clerk-user-id')
      if (current && !current.startsWith('demo_')) {
        localStorage.removeItem('clerk-user-id')
        localStorage.removeItem('clerk-user-name')
        localStorage.removeItem('clerk-user-email')
      }
    }
  }, [userId, user])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  const userObj = { 
    id: dbUser?.id || userId, 
    username: dbUser?.username || user?.username || user?.firstName || 'Guest' 
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white selection:bg-emerald-500/30 selection:text-emerald-400">
      {/* Navbar */}
      <header className="bg-gray-900/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <Link to="/" className="group flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <div className="h-5 w-5 border-2 border-white rounded-sm rotate-45" />
              </div>
              <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                IRONLOG
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
              {[
                { name: 'Dashboard', path: '/' },
                { name: 'Missions', path: '/goals' },
                { name: 'Matrix', path: '/heatmap' },
                { name: 'Trends', path: '/graph' },
                { name: 'Progress', path: '/progress' },
                { name: 'Arena', path: '/leaderboard' },
                { name: 'Social', path: '/social' },
                { name: 'Fuel', path: '/nutrition' },
                { name: 'Vault', path: '/videos' },
                { name: 'Coach', path: '/ai' },
              ].map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => cn(
                    "px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300",
                    isActive 
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-6">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="bg-white text-black px-6 py-2 rounded-xl text-sm font-black hover:bg-gray-200 transition-colors shadow-lg">
                    LOGIN
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Authenticated</span>
                    <span className="text-xs font-bold text-gray-400">{userObj.username}</span>
                  </div>
                  <UserButton 
                    afterSignOutUrl="/" 
                    appearance={{
                      elements: {
                        avatarBox: "h-10 w-10 rounded-xl border border-white/10"
                      }
                    }}
                  />
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      {/* Routes */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <Routes>
          <Route path="/" element={<Dashboard user={userObj} />} />
          <Route path="/goals" element={<Goals user={userObj} />} />
          <Route path="/heatmap" element={<Heatmap user={userObj} />} />
          <Route path="/graph" element={<IntensityGraph />} />
          <Route path="/progress" element={<Progress user={userObj} />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/social" element={<Social />} />
          <Route path="/nutrition" element={<Nutrition user={userObj} />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/ai" element={<AICoach />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Toaster position="top-right" />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  )
}
