import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Zap, ShieldAlert, Sparkles } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { chatWithAI } from '../lib/api'

export default function AICoach() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'IRON INTELLIGENCE ONLINE. SYSTEMS NOMINAL. READY TO OPTIMIZE YOUR PERFORMANCE. WHAT IS YOUR OBJECTIVE?' }
  ])
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  const chatMutation = useMutation({
    mutationFn: (message) => chatWithAI(message),
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    },
    onError: (err) => {
      const errorMsg = err.data?.message || err.message || "COMMUNICATIONS FAILURE. THE IRON COACH IS OFFLINE."
      setMessages(prev => [...prev, { role: 'assistant', content: `[ERROR]: ${errorMsg}`, isError: true }])
    }
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim() || chatMutation.isPending) return

    const userMessage = input.trim()
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setInput('')
    chatMutation.mutate(userMessage)
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase">Iron Intelligence</h1>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-bold text-emerald-500/70 uppercase tracking-widest">Systems Active</p>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-xl">
          <Zap className="h-4 w-4 text-emerald-500" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Powered by Gemini 1.5 Flash</span>
        </div>
      </div>

      <div className="flex-1 bg-gray-900/50 border border-gray-800 rounded-[2.5rem] p-6 md:p-10 shadow-2xl overflow-hidden flex flex-col relative">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar"
        >
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border ${
                  msg.role === 'user' 
                    ? 'bg-gray-800 border-gray-700 text-gray-400' 
                    : msg.isError 
                      ? 'bg-red-500/10 border-red-500/20 text-red-500'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
                <div className={`p-5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white font-medium'
                    : msg.isError
                      ? 'bg-red-900/20 border border-red-500/30 text-red-200 italic'
                      : 'bg-gray-800/80 border border-gray-700 text-gray-300'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="flex gap-4 items-center bg-gray-800/50 px-6 py-4 rounded-2xl border border-gray-700">
                <div className="flex gap-1">
                  <div className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce" />
                </div>
                <span className="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.2em]">Processing...</span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="mt-8 relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="COMMAND THE COACH..."
            className="w-full bg-gray-950 border-2 border-gray-800 focus:border-emerald-500/50 text-white rounded-2xl py-5 px-6 pr-16 outline-none transition-all placeholder:text-gray-700 font-bold tracking-wide uppercase text-sm"
          />
          <button 
            type="submit"
            disabled={!input.trim() || chatMutation.isPending}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-800 disabled:text-gray-600 text-emerald-950 flex items-center justify-center transition-all shadow-lg shadow-emerald-500/20"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Sparkles, text: "Suggest a 15-min HIIT session" },
          { icon: Zap, text: "Analyze my recent intensity trends" },
          { icon: ShieldAlert, text: "Help me crush my active goals" }
        ].map((hint, i) => (
          <button 
            key={i}
            onClick={() => setInput(hint.text)}
            className="p-4 bg-gray-900/30 border border-gray-800 hover:border-emerald-500/30 hover:bg-emerald-500/5 rounded-2xl flex items-center gap-3 transition-all group text-left"
          >
            <hint.icon className="h-4 w-4 text-gray-500 group-hover:text-emerald-400" />
            <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300 uppercase tracking-wider">{hint.text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
