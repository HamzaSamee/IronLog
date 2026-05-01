import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFriends, getMessages, sendMessage } from '../lib/api'
import { MessageSquare, User, Send, Zap, Ghost } from 'lucide-react'

export default function Social() {
  const queryClient = useQueryClient()
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [input, setInput] = useState('')
  const chatEndRef = useRef(null)

  const { data: friends } = useQuery({ queryKey: ['friends'], queryFn: getFriends })
  const { data: messages } = useQuery({ 
    queryKey: ['messages', selectedFriend?.id], 
    queryFn: () => getMessages(selectedFriend.id),
    enabled: !!selectedFriend,
    refetchInterval: 1000 // Real-time polling every 1 second as requested
  })

  const sendMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      setInput('')
      queryClient.invalidateQueries(['messages', selectedFriend.id])
    }
  })

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim() || !selectedFriend) return
    sendMutation.mutate({ receiver_id: selectedFriend.id, content: input })
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-180px)] flex gap-8">
      <div className="w-80 bg-gray-900/50 border border-gray-800 rounded-[3rem] p-8 flex flex-col gap-8 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
            <Zap className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tighter text-white">Allies</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {friends?.map(friend => (
            <button
              key={friend.id}
              onClick={() => setSelectedFriend(friend)}
              className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-3 ${
                selectedFriend?.id === friend.id 
                  ? 'bg-purple-600 border-purple-500 shadow-lg shadow-purple-500/20 text-white' 
                  : 'bg-black/30 border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-black ${
                selectedFriend?.id === friend.id ? 'bg-white text-purple-600' : 'bg-gray-800'
              }`}>
                {friend.username?.[0].toUpperCase()}
              </div>
              <span className="font-bold text-sm uppercase">{friend.username}</span>
            </button>
          ))}
          {!friends?.length && (
            <div className="text-center py-10 opacity-30">
              <Ghost className="h-10 w-10 mx-auto mb-2" />
              <p className="text-[10px] font-black uppercase">No Allies Found</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-gray-900/50 border border-gray-800 rounded-[3rem] flex flex-col overflow-hidden shadow-2xl relative">
        {selectedFriend ? (
          <>
            <div className="p-8 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                  {selectedFriend.username?.[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{selectedFriend.username}</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Connection Live</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-black/20">
              {messages?.map((msg, i) => {
                const isMe = msg.sender_id !== selectedFriend.id
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[70%] p-4 rounded-2xl text-sm font-medium ${
                      isMe 
                        ? 'bg-purple-600 text-white rounded-tr-none shadow-lg' 
                        : 'bg-gray-800 text-gray-300 rounded-tl-none border border-gray-700'
                    }`}>
                      {msg.message_text}
                      <div className={`text-[9px] mt-1 opacity-50 font-bold uppercase ${isMe ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-8 bg-gray-900/80 border-t border-gray-800">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-black/50 border-2 border-gray-800 focus:border-purple-500/50 rounded-2xl py-4 px-6 pr-16 outline-none transition-all text-white font-medium"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-gray-800 text-white flex items-center justify-center transition-all shadow-lg"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20">
            <MessageSquare className="h-20 w-20 mb-4" />
            <p className="text-xl font-black uppercase tracking-[0.3em]">Select an Ally to Chat</p>
          </div>
        )}
      </div>
    </div>
  )
}
