import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAllUsers, getLeaderboard, addFriend } from '../lib/api'
import { Trophy, Users, UserPlus, Flame, Search, Medal, Crown } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Leaderboard() {
  const queryClient = useQueryClient()
  const { data: users, isLoading: usersLoading } = useQuery({ queryKey: ['users'], queryFn: getAllUsers })
  const { data: leaderboard, isLoading: lbLoading } = useQuery({ queryKey: ['leaderboard'], queryFn: getLeaderboard })

  const friendMutation = useMutation({
    mutationFn: addFriend,
    onSuccess: () => {
      toast.success('Friend request sent!')
      queryClient.invalidateQueries(['friends'])
    },
    onError: () => toast.error('Already friends or pending!')
  })

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-[2rem] bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-lg shadow-amber-500/5">
          <Trophy className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Iron Arena</h1>
          <p className="text-gray-400 font-medium uppercase tracking-widest text-xs">Battle for consistency. Rule the matrix.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-[3rem] overflow-hidden">
            <div className="p-8 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <Crown className="h-6 w-6 text-amber-500" />
                Global Hall of Fame
              </h3>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ranked by Sessions</span>
            </div>
            
            <div className="p-0">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-500 text-[10px] font-black uppercase tracking-widest bg-black/20">
                    <th className="px-8 py-4">Rank</th>
                    <th className="px-8 py-4">Warrior</th>
                    <th className="px-8 py-4">Sessions</th>
                    <th className="px-8 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {leaderboard?.map((entry, i) => (
                    <tr key={entry.id} className="group hover:bg-white/5 transition-all">
                      <td className="px-8 py-6">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-black ${
                          i === 0 ? 'bg-amber-500 text-amber-950' : 
                          i === 1 ? 'bg-slate-300 text-slate-800' :
                          i === 2 ? 'bg-orange-400 text-orange-950' : 'bg-gray-800 text-gray-400'
                        }`}>
                          {i + 1}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 font-bold uppercase">
                            {entry.username?.[0]}
                          </div>
                          <span className="font-bold text-white uppercase text-sm">{entry.username}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <Flame className="h-4 w-4 text-orange-500" />
                          <span className="font-black text-white">{entry.activity_count}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-[2.5rem] p-8 h-full">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-400" />
              Recruit Allies
            </h3>
            <div className="space-y-4">
              {users?.map(u => (
                <div key={u.id} className="p-4 bg-black/30 border border-gray-800 rounded-2xl flex items-center justify-between group hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-black text-xs">
                      {u.username?.[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white uppercase">{u.username}</div>
                      <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{u.goal_type?.replace('_', ' ') || 'Iron Warrior'}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => friendMutation.mutate(u.id)}
                    className="h-8 w-8 rounded-lg bg-gray-800 text-gray-400 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all"
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
