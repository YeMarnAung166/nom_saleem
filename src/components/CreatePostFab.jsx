import { Plus } from 'lucide-react'
import { useState } from 'react'
import PostModal from './PostModal'

export default function CreatePostFab({ coupleId, onPostCreated }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 bg-pink-600 text-white p-4 rounded-full shadow-lg z-40 transition-transform active:scale-95"
      >
        <Plus size={24} />
      </button>
      {isOpen && <PostModal coupleId={coupleId} onClose={() => setIsOpen(false)} onPostCreated={onPostCreated} />}
    </>
  )
}