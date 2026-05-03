import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWeightLogs, logWeight, updateGoalType } from '../lib/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Scale, Target, TrendingUp, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Progress({ user }) {
  const queryClient = useQueryClient()
  const [weight, setWeight] = useState('')
  const [goal, setGoal] = useState(user?.goal_type || 'maintenance')

  const { data: logs } = useQuery({ queryKey: ['weight'], queryFn: getWeightLogs })

  const logMutation = useMutation({
    mutationFn: logWeight,
    onSuccess: () => {
      toast.success('Weight logged!')
      queryClient.invalidateQueries(['weight'])
      setWeight('')
    }
  })

  const goalMutation = useMutation({
    mutationFn: updateGoalType,
    onSuccess: () => toast.success('Plan updated!')
  })

  const chartData = logs?.map(log => ({
    date: new Date(log.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: parseFloat(log.weight)
  })) || []

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-[2rem] bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5">
            <Scale className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Body Progress</h1>
            <p className="text-gray-400 font-medium">Track your evolution and master your metrics.</p>
          </div>
        </div>

        <div className="flex bg-gray-900/50 p-2 rounded-2xl border border-gray-800">
          {['weight_loss', 'maintenance', 'weight_gain'].map((type) => (
            <button
              key={type}
              onClick={() => {
                setGoal(type)
                goalMutation.mutate({ goal_type: type })
              }}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                goal === type ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-[3rem] p-8 md:p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
            <TrendingUp className="h-64 w-64 text-blue-400" />
          </div>
          
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Weight Variance
            </h3>
            <div className="text-xs font-black text-blue-400 uppercase tracking-widest bg-blue-400/10 px-4 py-1.5 rounded-full border border-blue-400/20">
              Live Analytics
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="date" stroke="#4b5563" fontSize={12} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#4b5563" fontSize={12} axisLine={false} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#030712', border: '1px solid #1f2937', borderRadius: '16px' }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorWeight)" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-800/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              Update Metric
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-black/40 border border-gray-700 rounded-2xl py-4 px-6 text-2xl font-black text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-800"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 font-black text-sm uppercase">KG</span>
              </div>
              <button
                onClick={() => logMutation.mutate({ weight: parseFloat(weight) })}
                disabled={!weight || logMutation.isPending}
                className="w-full bg-blue-500 hover:bg-blue-400 disabled:bg-gray-800 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
              >
                Sync Weight <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-500/20">
            <h4 className="text-2xl font-black uppercase tracking-tighter leading-none mb-2 italic">Iron Will</h4>
            <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-6">Consistency equals results.</p>
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-lg">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase opacity-60">Daily Focus</p>
                <p className="text-sm font-black uppercase">{goal === 'weight_loss' ? 'Caloric Deficit' : 'Caloric Surplus'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
