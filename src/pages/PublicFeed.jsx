import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatFull } from '../lib/formatDate'

export default function PublicFeed() {
  const { token } = useParams()
  const [posts, setPosts] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSharedFeed()
  }, [token])

  async function fetchSharedFeed() {
    const { data: link, error: linkError } = await supabase
      .from('share_links')
      .select('couple_id')
      .eq('token', token)
      .eq('active', true)
      .eq('post_id', null)
      .single()
    if (linkError || !link) {
      setError('Link not found or expired')
      return
    }
    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .eq('couple_id', link.couple_id)
      .order('created_at', { ascending: false })
    setPosts(postsData || [])
  }

  if (error) return <div className="p-4 text-center text-red-500">{error}</div>
  if (!posts.length) return <div className="p-4 text-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <h1 className="text-2xl font-bold text-center mb-4 dark:text-white">Shared Memories</h1>
      <div className="max-w-lg mx-auto space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
            <p className="text-sm text-gray-400 dark:text-gray-500">{formatFull(post.created_at)}</p>
            {post.content_type === 'note' && <p className="mt-2 dark:text-white">{post.text_content}</p>}
            {post.content_type === 'photo' && <img src={post.media_url} className="w-full rounded mt-2" />}
            {post.content_type === 'video' && <video src={post.media_url} controls className="w-full rounded mt-2" />}
          </div>
        ))}
      </div>
    </div>
  )
}