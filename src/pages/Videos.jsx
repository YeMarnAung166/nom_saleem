import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'
import CreatePostFab from '../components/CreatePostFab'
import { formatRelative } from '../lib/formatDate'
import { Play } from 'lucide-react'
import { PostSkeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'

export default function Videos() {
  const { user } = useAuth()
  const [videos, setVideos] = useState([])
  const [couple, setCouple] = useState(null)
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState(null)

  useEffect(() => {
    fetchCouple()
  }, [user])

  async function fetchCouple() {
    const { data } = await supabase
      .from('couples')
      .select('*')
      .or(`creator1_id.eq.${user.id},creator2_id.eq.${user.id}`)
      .single()
    setCouple(data)
    if (data) fetchVideos(data.id)
    else setLoading(false)
  }

  async function fetchVideos(coupleId) {
    setLoading(true)
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('couple_id', coupleId)
      .eq('content_type', 'video')
      .order('created_at', { ascending: false })
    setVideos(data || [])
    setLoading(false)
  }

  if (!couple) return null

  return (
    <div className="pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Videos</h1>
        {loading && <PostSkeleton />}
        {!loading && videos.length === 0 && <EmptyState type="videos" />}
        <div className="space-y-4">
          {videos.map(video => (
            <div key={video.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <p className="text-xs text-gray-400 p-2">{formatRelative(video.created_at)}</p>
              {playingId === video.id ? (
                <video src={video.media_url} controls autoPlay className="w-full" />
              ) : (
                <div className="relative cursor-pointer" onClick={() => setPlayingId(video.id)}>
                  <video src={video.media_url} preload="metadata" className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <Play size={48} className="text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <CreatePostFab coupleId={couple.id} onPostCreated={() => fetchVideos(couple.id)} />
      <BottomNav />
    </div>
  )
}