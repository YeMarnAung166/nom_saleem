import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Trash2, Edit } from 'lucide-react'
import { formatFull } from '../lib/formatDate'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function PostDetail() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    fetchPost()
  }, [id])

  async function fetchPost() {
    const { data } = await supabase.from('posts').select('*').eq('id', id).single()
    setPost(data)
  }

  async function handleDelete() {
    if (window.confirm('Delete this memory?')) {
      const { error } = await supabase.from('posts').delete().eq('id', id)
      if (error) toast.error(error.message)
      else {
        toast.success('Deleted')
        navigate(-1)
      }
    }
  }

  if (!post) return <div className="p-4 dark:text-white">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 flex items-center justify-between shadow">
        <button onClick={() => navigate(-1)} className="dark:text-white"><ArrowLeft /></button>
        <div className="flex gap-4">
          <button onClick={handleDelete} className="text-red-500"><Trash2 /></button>
        </div>
      </div>
      <div className="p-4 max-w-lg mx-auto">
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-2">{formatFull(post.created_at)}</p>
        {post.content_type === 'note' && <p className="dark:text-white text-lg">{post.text_content}</p>}
        {post.content_type === 'photo' && <img src={post.media_url} className="w-full rounded-lg" />}
        {post.content_type === 'video' && <video src={post.media_url} controls className="w-full rounded-lg" autoPlay />}
      </div>
    </div>
  )
}