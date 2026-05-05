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
import { AnimatePresence, motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Target, 
  Grid3X3, 
  TrendingUp, 
  Activity, 
  Trophy, 
  Users, 
  Zap, 
  Library, 
  Bot, 
  ChevronDown,
  Menu,
  X,
  MoreHorizontal
} from 'lucide-react'
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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  const mainNavItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Missions', path: '/goals', icon: Target },
    { name: 'Matrix', path: '/heatmap', icon: Grid3X3 },
    { name: 'Trends', path: '/graph', icon: TrendingUp },
  ]

  const moreNavItems = [
    { name: 'Progress', path: '/progress', icon: Activity },
    { name: 'Arena', path: '/leaderboard', icon: Trophy },
    { name: 'Social', path: '/social', icon: Users },
    { name: 'Fuel', path: '/nutrition', icon: Zap },
    { name: 'Vault', path: '/videos', icon: Library },
    { name: 'Coach', path: '/ai', icon: Bot },
  ]

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsMoreOpen(false)
  }, [location])

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
    <div className="min-h-screen bg-[#020617] text-white selection:bg-emerald-500/30 selection:text-emerald-400 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="blob w-[500px] h-[500px] bg-emerald-500/10 top-[-100px] left-[-100px] animate-pulse" />
      <div className="blob w-[400px] h-[400px] bg-blue-500/10 bottom-[-100px] right-[-100px] animate-pulse-slow" />
      <div className="blob w-[300px] h-[300px] bg-purple-500/10 top-[20%] right-[10%] animate-pulse" />

      {/* Navbar */}
      <header className="bg-gray-900/40 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="group flex items-center gap-2 flex-shrink-0">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <div className="h-5 w-5 border-2 border-white rounded-sm rotate-45" />
              </div>
              <span className="text-xl md:text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent hidden xs:block">
                IRONLOG
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
              {mainNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
                    isActive 
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
              
              {/* More Dropdown */}
              <div className="relative" onMouseLeave={() => setIsMoreOpen(false)}>
                <button
                  onMouseEnter={() => setIsMoreOpen(true)}
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
                    isMoreOpen || moreNavItems.some(item => location.pathname === item.path)
                      ? "text-emerald-400 bg-white/5" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <MoreHorizontal className="w-4 h-4" />
                  <span>More</span>
                  <ChevronDown className={cn("w-3 h-3 transition-transform", isMoreOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {isMoreOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-gray-900/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl p-2 z-50"
                      onMouseLeave={() => setIsMoreOpen(false)}
                    >
                      {moreNavItems.map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          className={({ isActive }) => cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                            isActive 
                              ? "bg-emerald-500/10 text-emerald-400" 
                              : "text-gray-400 hover:text-white hover:bg-white/5"
                          )}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.name}
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Auth & Mobile Toggle */}
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="hidden sm:block">
                <SignedIn>
                  <div className="flex items-center gap-4">
                    <div className="hidden xl:flex flex-col items-end">
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
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="bg-white text-black px-6 py-2 rounded-xl text-sm font-black hover:bg-gray-200 transition-colors shadow-lg">
                      LOGIN
                    </button>
                  </SignInButton>
                </SignedOut>
              </div>

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <div className="sm:hidden">
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-2xl border-b border-white/5 p-6 space-y-6 overflow-hidden z-40"
            >
              <div className="grid grid-cols-2 gap-3">
                {[...mainNavItems, ...moreNavItems].map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold transition-all",
                      isActive 
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                        : "bg-white/5 text-gray-400 border border-white/5"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
              
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="w-full bg-white text-black py-4 rounded-2xl font-black text-sm shadow-xl">
                    GET STARTED
                  </button>
                </SignInButton>
              </SignedOut>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Routes with Transitions */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Routes location={location}>
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
          </motion.div>
        </AnimatePresence>
      </main>

      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1e293b',
          color: '#fff',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)'
        }
      }} />
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
