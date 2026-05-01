import { useQuery } from '@tanstack/react-query'
import { getLogs } from '../lib/api.js'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingUp, Activity, Calendar } from 'lucide-react'

export default function IntensityGraph() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: getLogs,
  })

  const chartData = logs?.slice(-14).map(log => ({
    date: new Date(log.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    intensity: Number(log.intensity || 0),
    name: log.activity_name
  })) || []

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="animate-pulse text-emerald-500 font-black tracking-widest">ANALYZING TRENDS...</div>
        </div>
      )
    }

    if (!chartData || chartData.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-gray-500 font-bold uppercase tracking-widest text-center px-6">
          No logs detected for visualization.<br/>Log your first session on the dashboard.
        </div>
      )
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#9ca3af" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            domain={[0, 10]}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#111827', 
              border: '1px solid #374151', 
              borderRadius: '16px',
              padding: '12px'
            }}
            itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
          />
          <Area 
            type="monotone" 
            dataKey="intensity" 
            stroke="#10b981" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorIntensity)" 
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
          <TrendingUp className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Intensity Metrics</h1>
          <p className="text-gray-400 text-lg">Visualizing your last 14 sessions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-gray-900/50 border border-gray-800 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Activity className="h-64 w-64 text-emerald-500" />
          </div>

          <div className="h-[400px] min-h-[400px] w-full">
            {renderContent()}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-[2.5rem] p-8">
            <h3 className="text-xl font-bold text-white mb-6">Recent Logs</h3>
            <div className="space-y-4">
              {logs?.slice(-5).reverse().map((log, i) => (
                <div key={i} className="p-4 bg-gray-900/50 border border-gray-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{log.activity_name}</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{new Date(log.start_time).toLocaleDateString()}</div>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black text-xs">
                    {log.intensity}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-500 rounded-[2.5rem] p-8 text-emerald-950">
            <Calendar className="h-8 w-8 mb-4 opacity-50" />
            <h4 className="text-xl font-black leading-tight mb-2">Consistency is Key</h4>
            <p className="text-sm font-medium opacity-80">
              The more data you feed the system, the more accurate your performance insights become.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
