import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatRelative } from '../lib/formatDate'
import { PostSkeleton } from './Skeleton'
import EmptyState from './EmptyState'
import { useNavigate } from 'react-router-dom'
import { usePlayOnScroll } from '../hooks/usePlayOnScroll'
import { Eye, Heart } from 'lucide-react'

function ScrollVideo({ src, poster }) {
  const videoRef = usePlayOnScroll()
  return (
    <div className="relative aspect-video w-full mt-2 overflow-hidden rounded-xl bg-black/5">
      <video
        ref={videoRef}
        src={src}
        poster={poster || undefined}
        muted
        playsInline
        preload="metadata"
        controls
        className="w-full h-full object-contain"
      />
    </div>
  )
}

export default function RecentPosts({ coupleId }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchRecent()
  }, [coupleId])

  async function fetchRecent() {
    setLoading(true)
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false })
      .limit(10)
    setPosts(data || [])
    setLoading(false)
  }

  if (loading) return <PostSkeleton />
  if (posts.length === 0) return <EmptyState type="home" />

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold dark:text-white px-1">✨ Recent memories</h2>
      {posts.map(post => (
        <div
          key={post.id}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden active:scale-[0.99] transition-transform duration-150"
          onClick={() => navigate(`/post/${post.id}`)}
        >
          <div className="p-3 pb-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">{formatRelative(post.created_at)}</p>
            {post.content_type === 'note' && (
              <p className="mt-2 text-gray-700 dark:text-gray-200 line-clamp-3">{post.text_content}</p>
            )}
          </div>
          {post.content_type === 'photo' && (
            <img src={post.media_url} className="w-full max-h-80 object-cover" alt="memory" loading="lazy" />
          )}
          {post.content_type === 'video' && (
            <ScrollVideo src={post.media_url} poster={post.thumbnail_url} />
          )}
          <div className="p-3 pt-2 flex justify-between items-center text-gray-400 text-xs">
            <span className="capitalize">{post.content_type}</span>
            <span className="flex items-center gap-1">
              <Eye size={12} /> 0
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}