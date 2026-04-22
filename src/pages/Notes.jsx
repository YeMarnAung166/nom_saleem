import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'
import CreatePostFab from '../components/CreatePostFab'
import { formatRelative } from '../lib/formatDate'
import { PostSkeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import { useNavigate } from 'react-router-dom'

export default function Notes() {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [couple, setCouple] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

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
    if (data) fetchNotes(data.id)
    else setLoading(false)
  }

  async function fetchNotes(coupleId) {
    setLoading(true)
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('couple_id', coupleId)
      .eq('content_type', 'note')
      .order('created_at', { ascending: false })
    setNotes(data || [])
    setLoading(false)
  }

  if (!couple) return null

  return (
    <div className="pb-20">
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold dark:text-white">Notes</h1>
        {loading && <PostSkeleton />}
        {!loading && notes.length === 0 && <EmptyState type="notes" />}
        {notes.map(note => (
          <div
            key={note.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow cursor-pointer"
            onClick={() => navigate(`/post/${note.id}`)}
          >
            <p className="text-sm text-gray-400 dark:text-gray-500">{formatRelative(note.created_at)}</p>
            <p className="mt-2 dark:text-gray-200">{note.text_content}</p>
          </div>
        ))}
      </div>
      <CreatePostFab coupleId={couple.id} onPostCreated={() => fetchNotes(couple.id)} />
      <BottomNav />
    </div>
  )
}