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

  async function handleSubmit(e) {
    e.preventDefault()
    setUploading(true)
    let mediaUrl = null
    if (file && (type === 'photo' || type === 'video')) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { error } = await supabase.storage
        .from('posts')
        .upload(`${coupleId}/${fileName}`, file)
      if (error) {
        toast.error(error.message)
        setUploading(false)
        return
      }
      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(`${coupleId}/${fileName}`)
      mediaUrl = publicUrl
    }
    const { error } = await supabase.from('posts').insert({
      couple_id: coupleId,
      author_id: user.id,
      content_type: type,
      text_content: type === 'note' ? text : text || '',
      media_url: mediaUrl
    })
    setUploading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Memory saved!')
      onPostCreated()
      onClose()
    }
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
                onClick={() => setType(t)}
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
            <input
              type="file"
              accept={type === 'photo' ? 'image/*' : 'video/*'}
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
          )}
          <button type="submit" disabled={uploading} className="w-full bg-pink-600 text-white py-2 rounded-lg disabled:opacity-50">
            {uploading ? 'Uploading...' : 'Post'}
          </button>
        </form>
      </div>
    </div>
  )
}