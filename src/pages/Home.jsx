import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'
import LiveCounter from '../components/LiveCounter'
import RecentPosts from '../components/RecentPosts'
import CreatePostFab from '../components/CreatePostFab'

export default function Home() {
  const { user } = useAuth()
  const [couple, setCouple] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    fetchCouple()
  }, [user])

  async function fetchCouple() {
    setLoading(true)
    const { data, error } = await supabase
      .from('couples')
      .select('*')
      .or(`creator1_id.eq.${user.id},creator2_id.eq.${user.id}`)
      .maybeSingle() // Use maybeSingle to avoid 406 error if no row

    if (error) {
      console.error('Error fetching couple:', error)
      setLoading(false)
      return
    }

    if (!data) {
      // No couple found – redirect to onboarding
      navigate('/onboarding')
      return
    }

    setCouple(data)
    setLoading(false)
  }

  if (loading) return <div className="p-4 dark:text-white text-center">Loading...</div>
  if (!couple) return null // Should never hit because of redirect

  return (
    <div className="pb-20">
      <div className="p-4 space-y-6">
        <LiveCounter sinceDate={couple.since_date} untilDate={couple.until_date} />
        <RecentPosts coupleId={couple.id} />
      </div>
      <CreatePostFab coupleId={couple.id} onPostCreated={() => fetchCouple()} />
      <BottomNav />
    </div>
  )
}