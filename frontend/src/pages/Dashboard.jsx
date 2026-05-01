import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/button.jsx'
import { Modal } from '../components/ui/modal.jsx'
import { useGymStore } from '../store/useGymStore'
import { getVideos, createLog, getGoals, updateGoal, getLogs } from '../lib/api.js'
import { Calendar, Dumbbell, Target, Zap, Plus, Info, ArrowRight, Play, ChevronLeft, ChevronRight, CheckCircle2, Circle, History } from 'lucide-react'
import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { cn } from '../lib/utils'
import { Link, useNavigate } from 'react-router-dom'

const VideoSlider = ({ videos }) => {
  const scrollRef = useRef(null)
  const navigate = useNavigate()

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }
  }

  return (
    <div className="relative group">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-2xl flex items-center gap-2">
          <Play className="h-6 w-6 text-red-500 fill-red-500" />
          Training Vault
        </h3>
        <div className="flex gap-2">
          <button onClick={() => scroll('left')} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={() => scroll('right')} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
      >
        {videos?.map((video) => (
          <div 
            key={video.id}
            onClick={() => navigate('/videos', { state: { selectedVideo: video } })}
            className="min-w-[280px] md:min-w-[320px] aspect-video rounded-3xl bg-gray-900 border border-gray-800 overflow-hidden relative group/video cursor-pointer snap-start"
          >
            <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover opacity-60 group-hover/video:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end">
              <h4 className="font-bold text-white group-hover/video:text-emerald-400 transition-colors">{video.title}</h4>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                  <Play className="h-4 w-4 text-white fill-white" />
                </div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Watch Now</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const LogForm = ({ onSubmit, isPending }) => {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [intensity, setIntensity] = useState(5)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name) return toast.error('Activity name is required')
    onSubmit({ activity_name: name, description: desc, intensity })
    setName('')
    setDesc('')
    setIntensity(5)
  }

  return (
    <div className="bg-gray-800/30 border border-gray-700/50 rounded-[2.5rem] p-8 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Zap className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Log Today's Session</h3>
          <p className="text-gray-500 text-sm">Quickly record your performance.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Activity Name</label>
          <input 
            type="text" 
            placeholder="e.g. Heavy Back Day, Morning Run..."
            className="w-full bg-gray-900/50 border border-gray-700 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500 transition-all placeholder:text-gray-600"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Description (Optional)</label>
          <textarea 
            placeholder="How did it go? Any PRs?"
            rows={2}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500 transition-all placeholder:text-gray-600"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between ml-1">
            <label className="text-xs font-black uppercase tracking-widest text-gray-500">Intensity</label>
            <span className="text-emerald-400 font-black text-xl">{intensity}</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="10" 
            className="w-full h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
          />
          <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-gray-600">
            <span>Chill</span>
            <span>Monster Mode</span>
          </div>
        </div>

        <Button type="submit" disabled={isPending} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-8 rounded-3xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 group transition-all">
          {isPending ? 'LOGGING...' : (
            <>
              LOG ACTIVITY
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}

const ActiveMissions = ({ missions, onToggle }) => {
  const activeMissions = missions?.filter(m => !m.completed).slice(0, 3)

  if (!activeMissions || activeMissions.length === 0) return null

  return (
    <div className="bg-gray-800/30 border border-gray-700/50 rounded-[2.5rem] p-8 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-400" />
          Active Missions
        </h3>
        <Link to="/goals" className="text-xs font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors">View All</Link>
      </div>
      <div className="space-y-4">
        {activeMissions.map((mission) => (
          <div 
            key={mission.id}
            className="group flex items-center justify-between p-4 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-emerald-500/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onToggle(mission.id, true)}
                className="text-gray-600 hover:text-emerald-400 transition-colors"
              >
                <Circle className="h-6 w-6" />
              </button>
              <div>
                <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">{mission.title}</div>
                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Priority {mission.priority}</div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard({ user }) {
  const queryClient = useQueryClient()
  
  const { data: videos } = useQuery({
    queryKey: ['videos'],
    queryFn: getVideos,
  })

  const { data: missions } = useQuery({
    queryKey: ['goals', user.id],
    queryFn: getGoals,
  })
  
  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: getLogs,
  })

  const recentLogs = logs?.slice(0, 3)

  const logMutation = useMutation({
    mutationFn: createLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] })
      queryClient.invalidateQueries({ queryKey: ['heatmap'] })
      toast.success('Activity logged! Keep grinding.')
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`)
    }
  })

  const completeMissionMutation = useMutation({
    mutationFn: ({ id, completed }) => updateGoal(id, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Mission Accomplished!', {
        icon: '🏆',
        style: { borderRadius: '20px', background: '#111827', color: '#fff', border: '1px solid #10b981' }
      })
    }
  })

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">System Active</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-white mb-2">
            IRON <span className="text-emerald-500">DASH.</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Welcome back, <span className="text-white font-bold">{user.username}</span>.
          </p>
        </div>
        <div className="bg-gray-800/30 border border-gray-700/50 p-6 rounded-[2rem] flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gray-900 flex items-center justify-center text-emerald-400 border border-gray-800">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Today's Date</div>
            <div className="text-white font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
          </div>
        </div>
      </div>

      {/* Video Slider */}
      <VideoSlider videos={videos} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <LogForm onSubmit={(data) => logMutation.mutate(data)} isPending={logMutation.isPending} />
          <ActiveMissions 
            missions={missions} 
            onToggle={(id, completed) => completeMissionMutation.mutate({ id, completed })} 
          />
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-[2.5rem] p-8 shadow-2xl shadow-emerald-500/20 group relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
              <Target className="h-40 w-40" />
            </div>
            <h3 className="text-2xl font-black text-white mb-4">MISSIONS</h3>
            <p className="text-emerald-50/70 mb-8 text-sm leading-relaxed">
              Track your long-term goals and stay consistent with your training blocks.
            </p>
            <Link to="/goals">
              <Button className="w-full bg-white text-emerald-600 hover:bg-emerald-50 font-black py-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 group/btn">
                GO TO MISSIONS
                <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="bg-gray-800/30 border border-gray-700/50 rounded-[2.5rem] p-8 backdrop-blur-sm">
            <h3 className="font-bold text-xl flex items-center gap-2 mb-8">
              <History className="h-6 w-6 text-blue-400" />
              Recent Progress
            </h3>
            <div className="space-y-4">
              {logsLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-16 bg-gray-900/50 rounded-2xl" />
                  <div className="h-16 bg-gray-900/50 rounded-2xl" />
                </div>
              ) : recentLogs?.length > 0 ? (
                recentLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-gray-900/50 border border-gray-800 rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                    <div>
                      <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">{log.activity_name}</div>
                      <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{new Date(log.start_time).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-gray-600 uppercase">INTENSITY</span>
                      <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black">
                        {log.intensity}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-gray-600 text-center">
                  <History className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm font-medium">No recent logs found.<br/>Start your first session above.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-800/30 border border-gray-700/50 rounded-[2.5rem] p-8 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-400" />
              Insights
            </h3>
            <div className="space-y-4">
              <Link to="/graph" className="block p-4 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-emerald-500/50 transition-colors group">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-400 group-hover:text-white">Intensity Graph</span>
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </div>
              </Link>
              <Link to="/heatmap" className="block p-4 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-emerald-500/50 transition-colors group">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-400 group-hover:text-white">Neural Heatmap</span>
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
