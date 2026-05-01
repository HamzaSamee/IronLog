import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getGoals, createGoal, updateGoal, deleteGoal } from '../lib/api.js'
import { Button } from '../components/ui/button.jsx'
import { Modal } from '../components/ui/modal.jsx'
import { Target, Plus, Trash2, Calendar as CalendarIcon, Star, CheckCircle2, Circle, History, Sparkles, Clock, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { cn } from '../lib/utils'

const RECOMMENDED_MISSIONS = [
  { id: 'r1', title: "Master the Deadlift", desc: "Reach 1.5x bodyweight for 5 reps.", difficulty: "Expert" },
  { id: 'r2', title: "Century Club", desc: "Log 100 sessions in a single year.", difficulty: "Hard" },
  { id: 'r3', title: "Mobility King", desc: "15 minutes of stretching for 30 days straight.", difficulty: "Medium" }
]

export default function Goals({ user }) {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({ title: '', description: '', priority: 1, deadline: '' })

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals', user.id],
    queryFn: () => getGoals(),
  })

  const addGoalMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Mission accepted!')
      setIsModalOpen(false)
      setNewGoal({ title: '', description: '', priority: 1, deadline: '' })
    },
  })

  const toggleGoalMutation = useMutation({
    mutationFn: ({ id, completed }) => updateGoal(id, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Status updated!')
    },
  })

  const removeGoalMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Mission deleted.')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newGoal.title) return toast.error('Title is required')
    addGoalMutation.mutate({ ...newGoal, user_id: user.id })
  }

  const activeGoals = goals?.filter(g => !g.completed) || []
  const completedGoals = goals?.filter(g => g.completed) || []

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-24 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-3xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <Target className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-white uppercase">Missions</h1>
            <p className="text-gray-400 text-lg">Define your targets and dominate your training blocks.</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-black py-8 px-10 rounded-3xl shadow-2xl shadow-emerald-500/20 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-6 w-6" />
          NEW MISSION
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Main Section (Active + Completed) */}
        <div className="lg:col-span-2 space-y-16">
          
          {/* Active Missions */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 ml-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">Live Objectives</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2].map(i => <div key={i} className="h-32 bg-gray-800/50 rounded-[2.5rem]" />)}
                </div>
              ) : activeGoals.length > 0 ? (
                activeGoals.map((goal) => (
                  <div 
                    key={goal.id} 
                    className="group bg-gray-800/30 border border-gray-700/50 rounded-[2.5rem] p-8 hover:border-emerald-500/50 transition-all hover:bg-gray-800/50 relative overflow-hidden shadow-xl"
                  >
                    <div className="absolute top-6 right-8 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                      <button 
                        onClick={() => toggleGoalMutation.mutate({ id: goal.id, completed: true })}
                        className="px-6 py-2 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-90"
                      >
                        DONE
                      </button>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <div className="space-y-4 flex-1">
                        <div>
                          <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors mb-2">{goal.title}</h3>
                          <p className="text-gray-400 leading-relaxed text-sm max-w-lg">{goal.description || 'Focus on the objective.'}</p>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          {goal.deadline && (
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                              <CalendarIcon className="h-3.5 w-3.5" />
                              Ends {new Date(goal.deadline).toLocaleDateString()}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            {Array.from({length: goal.priority}).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-gray-900/30 border-2 border-dashed border-gray-800 rounded-[3rem] py-16 flex flex-col items-center justify-center text-center px-10">
                  <Target className="h-12 w-12 text-gray-700 mb-4" />
                  <h4 className="text-xl font-bold text-gray-500">No active objectives</h4>
                  <button onClick={() => setIsModalOpen(true)} className="text-emerald-500 font-black text-xs uppercase tracking-widest mt-4 hover:text-emerald-400">Initialize Mission Board</button>
                </div>
              )}
            </div>
          </div>

          {/* Archives */}
          {completedGoals.length > 0 && (
            <div className="space-y-8 pt-8">
              <div className="flex items-center gap-3 ml-2">
                <History className="h-4 w-4 text-gray-600" />
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-600">The Vault (Archives)</h2>
              </div>
              
              <div className="space-y-4">
                {completedGoals.map((goal) => (
                  <div 
                    key={goal.id} 
                    className="bg-gray-900/40 border border-gray-800/50 rounded-3xl p-6 flex items-center justify-between group grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100"
                  >
                    <div className="flex items-center gap-6">
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-400 line-through group-hover:text-white transition-colors">{goal.title}</h4>
                        <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1 flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          Mastered on {new Date(goal.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleGoalMutation.mutate({ id: goal.id, completed: false })}
                      className="text-[10px] font-black text-gray-700 uppercase tracking-widest hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      Re-activate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Recommendations */}
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-[2.5rem] p-8 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              <h3 className="text-xl font-bold text-white">Suggested Missions</h3>
            </div>
            
            <div className="space-y-6">
              {RECOMMENDED_MISSIONS.map((rec) => (
                <div key={rec.id} className="space-y-3 p-5 bg-gray-900/50 border border-gray-800 rounded-[1.5rem] group hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                      rec.difficulty === 'Expert' ? "bg-red-500/10 text-red-500" :
                      rec.difficulty === 'Hard' ? "bg-orange-500/10 text-orange-500" :
                      "bg-blue-500/10 text-blue-500"
                    )}>
                      {rec.difficulty}
                    </span>
                  </div>
                  <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{rec.title}</h4>
                  <p className="text-xs text-gray-500 leading-tight">{rec.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-[2.5rem] p-8 text-emerald-950 shadow-2xl shadow-emerald-500/20">
            <h4 className="text-2xl font-black mb-2 tracking-tighter">ELITE CONSISTENCY</h4>
            <p className="text-sm font-medium opacity-80 leading-relaxed">
              Missions completed in the archives boost your overall neural matrix density. Keep mastering objectives.
            </p>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Initialize Mission"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mission Objective</label>
            <input 
              type="text" 
              className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-4 focus:outline-none focus:border-emerald-500 transition-colors text-white"
              placeholder="e.g. Bench Press 100kg"
              value={newGoal.title}
              onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tactical Details</label>
            <textarea 
              className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-4 focus:outline-none focus:border-emerald-500 transition-colors text-white"
              placeholder="Break down your strategy..."
              rows={3}
              value={newGoal.description}
              onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Priority Level</label>
              <select 
                className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-4 focus:outline-none focus:border-emerald-500 transition-colors text-white appearance-none"
                value={newGoal.priority}
                onChange={(e) => setNewGoal({...newGoal, priority: parseInt(e.target.value)})}
              >
                <option value={1}>Low Priority</option>
                <option value={2}>Medium Priority</option>
                <option value={3}>High Priority</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Deadline</label>
              <input 
                type="date" 
                className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-4 focus:outline-none focus:border-emerald-500 transition-colors text-white"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
              />
            </div>
          </div>

          <Button 
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-6 rounded-2xl shadow-lg shadow-emerald-500/20"
            disabled={addGoalMutation.isPending}
          >
            {addGoalMutation.isPending ? 'Deploying...' : 'Accept Mission'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
