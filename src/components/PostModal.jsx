import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { X, Image, Video, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PostModal({ coupleId, onClose, onPostCreated }) {
  const { user } = useAuth()
  const [type, setType] = useState('note')
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    // Validate file type
    const isImage = selectedFile.type.startsWith('image/')
    const isVideo = selectedFile.type.startsWith('video/')
    if ((type === 'photo' && !isImage) || (type === 'video' && !isVideo)) {
      toast.error(`Please select a valid ${type}`)
      e.target.value = ''
      return
    }

    // Validate file size (50MB max)
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error('File too large (max 50MB)')
      e.target.value = ''
      return
    }

    setFile(selectedFile)
  }

  const uploadMedia = async () => {
    if (!file) return null

    // Create unique file path: coupleId/timestamp_filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`
    const filePath = `${coupleId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('couple-memories')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type // important for videos
      })

    if (uploadError) {
      toast.error('Upload failed: ' + uploadError.message)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('couple-memories')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const savePost = async (mediaUrl) => {
    const { error } = await supabase.from('posts').insert({
      couple_id: coupleId,
      author_id: user.id,
      content_type: type,
      text_content: type === 'note' ? text : (text || ''),
      media_url: mediaUrl
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
      await savePost(null)
      return
    }
    if (!file) {
      toast.error(`Please select a ${type}`)
      return
    }
    setUploading(true)
    const mediaUrl = await uploadMedia()
    if (mediaUrl) {
      await savePost(mediaUrl)
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
                  setFile(null) // reset file when switching type
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
                  Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-pink-600 text-white py-2 rounded-lg disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Post'}
          </button>
        </form>
      </div>
    </div>
  )
}