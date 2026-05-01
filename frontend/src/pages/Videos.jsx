import { useQuery } from '@tanstack/react-query'
import { getVideos } from '../lib/api.js'
import { useState, useEffect } from 'react'
import { Play, ArrowLeft, Video, Layout, Search } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function Videos() {
  const location = useLocation()
  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: getVideos,
  })

  const [selectedVideo, setSelectedVideo] = useState(null)

  useEffect(() => {
    if (location.state?.selectedVideo) {
      setSelectedVideo(location.state.selectedVideo)
    } else if (videos && videos.length > 0 && !selectedVideo) {
      setSelectedVideo(videos[0])
    }
  }, [location.state, videos, selectedVideo])

  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-t-2 border-emerald-500 rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="h-12 w-12 rounded-2xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors border border-gray-700">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Vault Gallery</h1>
            <p className="text-gray-400">Premium training content curated for you.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Player Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden border border-gray-800 shadow-2xl relative group">
            {selectedVideo ? (
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtube_id}?autoplay=1`}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold uppercase tracking-widest">
                Select a video to start training
              </div>
            )}
          </div>
          
          {selectedVideo && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Now Playing</span>
              </div>
              <h2 className="text-3xl font-black text-white mb-2">{selectedVideo.title}</h2>
              <p className="text-gray-500 leading-relaxed max-w-2xl">
                Master the techniques shown in this video. Consistency in form is the bedrock of iron progress. 
                Keep track of your intensity after every session.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Gallery */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Playlist
            </h3>
            <span className="text-[10px] font-black text-gray-600 uppercase">{videos?.length} Videos</span>
          </div>
          
          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
            {videos?.map((video) => (
              <button
                key={video._id}
                onClick={() => setSelectedVideo(video)}
                className={`w-full text-left group flex gap-4 p-4 rounded-3xl transition-all border ${
                  selectedVideo?._id === video._id 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : 'bg-gray-800/20 border-gray-700/30 hover:border-emerald-500/30 hover:bg-gray-800/40'
                }`}
              >
                <div className="relative h-20 w-32 shrink-0 rounded-2xl overflow-hidden bg-black">
                  <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform" />
                  <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${selectedVideo?._id === video._id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                      <Play className="h-4 w-4 fill-white" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <div className={`text-sm font-bold leading-tight mb-1 transition-colors ${selectedVideo?._id === video._id ? 'text-emerald-400' : 'text-gray-300 group-hover:text-white'}`}>
                    {video.title}
                  </div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    {video.category || 'Technique'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
