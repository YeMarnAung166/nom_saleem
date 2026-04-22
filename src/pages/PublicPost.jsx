import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatFull } from '../lib/formatDate'

export default function PublicPost() {
  const { token } = useParams()
  const [post, setPost] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSharedPost()
  }, [token])

  async function fetchSharedPost() {
    const { data: link, error: linkError } = await supabase
      .from('share_links')
      .select('post_id')
      .eq('token', token)
      .eq('active', true)
      .single()
    if (linkError || !link || !link.post_id) {
      setError('Link not found or expired')
      return
    }
    const { data: postData } = await supabase
      .from('posts')
      .select('*')
      .eq('id', link.post_id)
      .single()
    setPost(postData)
  }

  if (error) return <div className="p-4 text-center text-red-500">{error}</div>
  if (!post) return <div className="p-4 text-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-4 shadow">
        <p className="text-sm text-gray-400 dark:text-gray-500">{formatFull(post.created_at)}</p>
        {post.content_type === 'note' && <p className="mt-2 text-lg dark:text-white">{post.text_content}</p>}
        {post.content_type === 'photo' && <img src={post.media_url} className="w-full rounded mt-2" />}
        {post.content_type === 'video' && <video src={post.media_url} controls className="w-full rounded mt-2" />}
        <p className="text-center text-gray-400 dark:text-gray-500 mt-4">Shared from CoupleVault</p>
      </div>
    </div>
  )
}