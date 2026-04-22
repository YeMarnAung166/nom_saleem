import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'
import CreatePostFab from '../components/CreatePostFab'
import { PhotoSkeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

export default function Photos() {
  const { user } = useAuth()
  const [photos, setPhotos] = useState([])
  const [couple, setCouple] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState(-1)

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
    if (data) fetchPhotos(data.id)
    else setLoading(false)
  }

  async function fetchPhotos(coupleId) {
    setLoading(true)
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('couple_id', coupleId)
      .eq('content_type', 'photo')
      .order('created_at', { ascending: false })
    setPhotos(data || [])
    setLoading(false)
  }

  if (!couple) return null

  return (
    <div className="pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Photos</h1>
        {loading && (
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => <PhotoSkeleton key={i} />)}
          </div>
        )}
        {!loading && photos.length === 0 && <EmptyState type="photos" />}
        {!loading && photos.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {photos.map((photo, i) => (
              <img
                key={photo.id}
                src={photo.media_url}
                className="rounded-lg w-full h-40 object-cover cursor-pointer"
                onClick={() => setLightboxIndex(i)}
              />
            ))}
          </div>
        )}
      </div>
      <CreatePostFab coupleId={couple.id} onPostCreated={() => fetchPhotos(couple.id)} />
      <BottomNav />
      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        slides={photos.map(p => ({ src: p.media_url }))}
        index={lightboxIndex}
      />
    </div>
  )
}