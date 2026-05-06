import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatRelative } from '../lib/formatDate'
import { PostSkeleton } from './Skeleton'
import EmptyState from './EmptyState'
import { useNavigate } from 'react-router-dom'
import { usePlayOnScroll } from '../hooks/usePlayOnScroll'

// Video player component with scroll-to-play
function ScrollVideo({ src, poster }) {
  const videoRef = usePlayOnScroll()
  return (
    <div className="aspect-video w-full mt-2 overflow-hidden bg-gray-100 dark:bg-gray-800 rounded">
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
    <div className="space-y-3">
      <h2 className="text-lg font-semibold dark:text-white">Recent memories</h2>
      {posts.map(post => (
        <div key={post.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow cursor-pointer" onClick={() => navigate(`/post/${post.id}`)}>
          <p className="text-xs text-gray-400 dark:text-gray-500">{formatRelative(post.created_at)}</p>
          {post.content_type === 'note' && (
            <p className="mt-1 dark:text-gray-200 line-clamp-3">{post.text_content}</p>
          )}
          {post.content_type === 'photo' && (
            <img src={post.media_url} className="w-full rounded mt-2" alt="memory" loading="lazy" />
          )}
          {post.content_type === 'video' && (
            <ScrollVideo src={post.media_url} poster={post.thumbnail_url} />
          )}
        </div>
      ))}
    </div>
  )
}