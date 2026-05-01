import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNutrition, logMeal, getDailyCalories } from '../lib/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Utensils, Plus, Activity, PieChart, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Nutrition({ user }) {
  const queryClient = useQueryClient()
  const [mealType, setMealType] = useState('breakfast')
  const [items, setItems] = useState([{ name: '', calories: '' }])

  const { data: meals } = useQuery({ queryKey: ['nutrition'], queryFn: getNutrition })
  const { data: dailyCals } = useQuery({ queryKey: ['daily-calories'], queryFn: getDailyCalories })

  const logMutation = useMutation({
    mutationFn: logMeal,
    onSuccess: () => {
      toast.success('Meal logged!')
      queryClient.invalidateQueries(['nutrition', 'daily-calories'])
      setItems([{ name: '', calories: '' }])
    }
  })

  const addItem = () => setItems([...items, { name: '', calories: '' }])
  const updateItem = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const chartData = dailyCals?.map(d => ({
    date: new Date(d.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    calories: parseInt(d.total_calories)
  })) || []

  // Daily target based on user profile or default
  const dailyTarget = user?.daily_caloric_target || 2500

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
          <Utensils className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Nutrition Engine</h1>
          <p className="text-gray-400 font-medium uppercase tracking-widest text-xs">Precision Fueling for Peak Performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-gray-900/50 border border-gray-800 rounded-[3rem] p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
              <PieChart className="h-64 w-64 text-emerald-400" />
            </div>
            
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <Activity className="h-6 w-6 text-emerald-400" />
                Caloric Intake Flow
              </h3>
              <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                Target: {dailyTarget} kcal
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="date" stroke="#4b5563" fontSize={12} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="#4b5563" fontSize={12} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#030712', border: '1px solid #1f2937', borderRadius: '16px' }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  />
                  <ReferenceLine y={dailyTarget} label={{ position: 'right', value: 'TARGET', fill: '#ef4444', fontSize: 10, fontWeight: 'black' }} stroke="#ef4444" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="calories" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#000' }} animationDuration={2000} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {meals?.map(meal => (
              <div key={meal.id} className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6 hover:border-emerald-500/20 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em]">{meal.meal_type}</div>
                  <div className="text-[10px] font-bold text-gray-600">{new Date(meal.log_date).toLocaleDateString()}</div>
                </div>
                <div className="space-y-2">
                  {meal.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                      <span className="text-sm font-bold text-gray-300 uppercase">{item.name}</span>
                      <span className="text-sm font-black text-white">{item.calories} <span className="text-[10px] text-gray-500">kcal</span></span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Energy</span>
                  <span className="text-lg font-black text-emerald-500">{meal.items.reduce((sum, i) => sum + i.calories, 0)} kcal</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/40 border border-white/5 rounded-[3rem] p-10 h-fit sticky top-28 backdrop-blur-xl shadow-2xl">
          <h3 className="text-xl font-black text-white mb-8 uppercase tracking-tight flex items-center gap-3">
            <Plus className="h-6 w-6 text-emerald-400" />
            Log Fuel
          </h3>
          
          <div className="space-y-8">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block">Meal Category</label>
              <select 
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full bg-black/40 border border-gray-700 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:border-emerald-500/50 appearance-none uppercase text-xs tracking-widest"
              >
                {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Components (3NF Breakdown)</label>
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="ITEM"
                    value={item.name}
                    onChange={(e) => updateItem(i, 'name', e.target.value)}
                    className="bg-black/40 border border-gray-700 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-emerald-500/30 uppercase"
                  />
                  <input
                    type="number"
                    placeholder="KCAL"
                    value={item.calories}
                    onChange={(e) => updateItem(i, 'calories', parseInt(e.target.value))}
                    className="bg-black/40 border border-gray-700 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-emerald-500/30"
                  />
                </div>
              ))}
              <button 
                onClick={addItem}
                className="w-full py-3 border border-dashed border-gray-700 rounded-xl text-[10px] font-black text-gray-500 hover:text-emerald-400 hover:border-emerald-500/50 transition-all uppercase tracking-[0.2em]"
              >
                + Add Component
              </button>
            </div>

            <button
              onClick={() => logMutation.mutate({ meal_type: mealType, items })}
              disabled={logMutation.isPending || items.some(i => !i.name || !i.calories)}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-800 text-white font-black py-5 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
            >
              Sync to Vault <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
