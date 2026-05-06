import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { X, Image, Video, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PostModal({ coupleId, onClose, onPostCreated }) {
  const { user } = useAuth()
  const [type, setType] = useState('note')
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)   // stores thumbnail blob
  const [uploading, setUploading] = useState(false)
  const videoPreviewRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    // Validate file type and size
    const isImage = selectedFile.type.startsWith('image/')
    const isVideo = selectedFile.type.startsWith('video/')
    if ((type === 'photo' && !isImage) || (type === 'video' && !isVideo)) {
      toast.error(`Please select a valid ${type}`)
      e.target.value = ''
      return
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error('File too large (max 50MB)')
      e.target.value = ''
      return
    }

    setFile(selectedFile)

    // For videos, generate a thumbnail immediately
    if (type === 'video') {
      generateThumbnail(selectedFile)
    } else {
      setThumbnail(null)
    }
  }

  const generateThumbnail = (videoFile) => {
    const url = URL.createObjectURL(videoFile)
    const video = document.createElement('video')
    video.src = url
    video.muted = true
    video.crossOrigin = 'Anonymous'
    video.currentTime = 0.1  // seek to 0.1 seconds to avoid black frame

    video.addEventListener('loadeddata', () => {
      video.play().then(() => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => {
          setThumbnail(blob)
          URL.revokeObjectURL(url)
        }, 'image/jpeg', 0.8)
        video.pause()
        video.currentTime = 0
      }).catch(err => {
        console.warn('Thumbnail generation failed', err)
      })
    })
  }

  const uploadMedia = async () => {
    if (!file) return null

    // Create unique file paths
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const fileName = `${timestamp}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`
    const videoPath = `${coupleId}/videos/${fileName}`

    // Upload video
    const { error: videoError } = await supabase.storage
      .from('couple-memories')
      .upload(videoPath, file, {
        cacheControl: '3600',
        contentType: file.type
      })
    if (videoError) {
      toast.error('Video upload failed: ' + videoError.message)
      return null
    }
    const { data: { publicUrl: videoUrl } } = supabase.storage
      .from('couple-memories')
      .getPublicUrl(videoPath)

    let thumbnailUrl = null
    if (thumbnail && type === 'video') {
      // Upload thumbnail
      const thumbExt = 'jpg'
      const thumbName = `${timestamp}_thumb.${thumbExt}`
      const thumbPath = `${coupleId}/thumbnails/${thumbName}`
      const { error: thumbError } = await supabase.storage
        .from('couple-memories')
        .upload(thumbPath, thumbnail, {
          cacheControl: '3600',
          contentType: 'image/jpeg'
        })
      if (!thumbError) {
        const { data: { publicUrl: thumbPublicUrl } } = supabase.storage
          .from('couple-memories')
          .getPublicUrl(thumbPath)
        thumbnailUrl = thumbPublicUrl
      } else {
        console.warn('Thumbnail upload failed', thumbError)
      }
    }

    return { videoUrl, thumbnailUrl }
  }

  const savePost = async (mediaUrl, thumbnailUrl) => {
    const { error } = await supabase.from('posts').insert({
      couple_id: coupleId,
      author_id: user.id,
      content_type: type,
      text_content: type === 'note' ? text : (text || ''),
      media_url: mediaUrl,
      thumbnail_url: thumbnailUrl   // new column
    })
    if (error) {
      toast.error('Failed to save memory: ' + error.message)
    } else {
      toast.success('Memory saved!')
      onPostCreated()
      onClose()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (type === 'note') {
      await savePost(null, null)
      return
    }
    if (!file) {
      toast.error(`Please select a ${type}`)
      return
    }
    if (type === 'video' && !thumbnail) {
      toast.error('Generating thumbnail, please wait...')
      return
    }
    setUploading(true)
    const result = await uploadMedia()
    if (result && result.videoUrl) {
      await savePost(result.videoUrl, result.thumbnailUrl)
    }
    setUploading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold dark:text-white">Create memory</h2>
          <button onClick={onClose} className="dark:text-white"><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="flex gap-2">
            {['note', 'photo', 'video'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t)
                  setFile(null)
                  setThumbnail(null)
                }}
                className={`flex-1 py-2 rounded-lg capitalize ${type === t ? 'bg-pink-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
              >
                {t === 'note' && <FileText className="inline mr-1" size={16} />}
                {t === 'photo' && <Image className="inline mr-1" size={16} />}
                {t === 'video' && <Video className="inline mr-1" size={16} />}
                {t}
              </button>
            ))}
          </div>

          {type === 'note' && (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your note..."
              className="w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white p-2 rounded h-32"
              required
            />
          )}

          {(type === 'photo' || type === 'video') && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                accept={type === 'photo' ? 'image/*' : 'video/*'}
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
              />
              {file && (
                <p className="mt-2 text-xs text-gray-500">
                  {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
              {thumbnail && type === 'video' && (
                <div className="mt-2">
                  <p className="text-xs text-green-600">✓ Thumbnail ready</p>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || (type === 'video' && !thumbnail)}
            className="w-full bg-pink-600 text-white py-2 rounded-lg disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Post'}
          </button>
        </form>
      </div>
    </div>
  )
}