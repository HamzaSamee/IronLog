import { useQuery } from '@tanstack/react-query'
import { getHeatmap } from '../lib/api.js'
import { Calendar, TrendingUp, Info } from 'lucide-react'
import { cn } from '../lib/utils'

const HeatmapGrid = ({ data }) => {
  const getColor = (intensity) => {
    if (!intensity || intensity === 0) return 'bg-gray-900 border-gray-800'
    if (intensity < 3) return 'bg-emerald-900 border-emerald-800'
    if (intensity < 6) return 'bg-emerald-700 border-emerald-600'
    if (intensity < 9) return 'bg-emerald-500 border-emerald-400'
    return 'bg-emerald-400 border-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.4)]'
  }

  // Generate last 365 days
  const days = Array.from({ length: 365 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (364 - i))
    return date
  })

  return (
    <div className="w-full overflow-x-auto pb-6 scrollbar-hide">
      <div className="min-w-[1000px] flex gap-2">
        {/* Days labels */}
        <div className="grid grid-rows-7 gap-[3px] text-[9px] font-black uppercase text-gray-700 pt-6 pr-2">
          <div className="h-3"></div>
          <div className="h-3">Mon</div>
          <div className="h-3"></div>
          <div className="h-3">Wed</div>
          <div className="h-3"></div>
          <div className="h-3">Fri</div>
          <div className="h-3"></div>
        </div>

        <div className="flex-1">
          <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
            {days.map((date, i) => {
              const dateStr = date.toISOString().split('T')[0]
              const dayData = data?.find(d => d.date.split('T')[0] === dateStr)
              const intensity = Number(dayData?.avg_intensity || 0)

              return (
                <div
                  key={i}
                  className={cn(
                    "w-[13px] h-[13px] rounded-[2px] border transition-all duration-500 group relative cursor-pointer hover:scale-125 hover:z-10",
                    getColor(intensity)
                  )}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all z-50 pointer-events-none shadow-2xl scale-75 group-hover:scale-100 origin-bottom">
                    <div className="font-black text-white mb-1">{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    <div className="flex items-center gap-1.5">
                      <div className={cn("h-1.5 w-1.5 rounded-full", intensity > 0 ? "bg-emerald-500" : "bg-gray-700")} />
                      <span className="text-gray-400 font-bold">Intensity: <span className="text-emerald-400">{intensity.toFixed(1)}</span></span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Heatmap() {
  const { data, isLoading } = useQuery({
    queryKey: ['heatmap'],
    queryFn: () => getHeatmap(365),
  })

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-inner">
            <TrendingUp className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Consistency Matrix</h1>
            <p className="text-gray-400 text-lg">Your momentum, visualized.</p>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-gray-800/30 p-4 rounded-2xl border border-gray-700/50">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-gray-800 border border-gray-700" />
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Zero</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-emerald-900 border border-emerald-800" />
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-emerald-500 border border-emerald-400" />
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-emerald-400 border border-white/20 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Peak</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
          <TrendingUp className="h-64 w-64 text-emerald-500 -rotate-12" />
        </div>
        
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-emerald-500 font-black tracking-widest">LOADING NEURAL MAP...</div>
          </div>
        ) : (
          <HeatmapGrid data={data} />
        )}

        <div className="mt-8 flex items-start gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
          <Info className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-400 leading-relaxed">
            This matrix tracks your average intensity across all logged activities. Darker squares represent higher volume and effort. 
            Stay consistent to light up the grid.
          </p>
        </div>
      </div>
    </div>
  )
}

