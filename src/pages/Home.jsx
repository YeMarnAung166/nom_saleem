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
  const [refreshKey, setRefreshKey] = useState(0)
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
      .maybeSingle()
    if (!data) {
      navigate('/onboarding')
      return
    }
    setCouple(data)
    setLoading(false)
  }

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  if (!couple) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20">
      <div className="p-4 space-y-6">
        <div className="pt-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Ye Marn Aung and Myat Honey Ko's Memories
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">our love story, preserved</p>
        </div>
        <LiveCounter sinceDate={couple.since_date} untilDate={couple.until_date} />
        <RecentPosts coupleId={couple.id} key={refreshKey} />
      </div>
      <CreatePostFab coupleId={couple.id} onPostCreated={() => setRefreshKey(r => r + 1)} />
      <BottomNav />
    </div>
  )
}