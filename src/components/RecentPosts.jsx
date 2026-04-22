import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatRelative } from '../lib/formatDate'
import { Play } from 'lucide-react'
import { PostSkeleton } from './Skeleton'
import EmptyState from './EmptyState'
import { useNavigate } from 'react-router-dom'

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
            <p className="mt-1 dark:text-gray-200">{post.text_content.slice(0, 100)}</p>
          )}
          {post.content_type === 'photo' && (
            <img src={post.media_url} className="w-full rounded mt-2" alt="memory" />
          )}
          {post.content_type === 'video' && (
            <div className="relative">
              <video src={post.media_url} className="w-full rounded mt-2" preload="metadata" />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded mt-2">
                <Play size={32} className="text-white" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}