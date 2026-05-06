import { Plus } from 'lucide-react'
import { useState } from 'react'
import PostModal from './PostModal'

export default function CreatePostFab({ coupleId, onPostCreated }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-5 bg-gradient-to-r from-pink-500 to-pink-600 text-white p-4 rounded-full shadow-lg z-40 transition-all duration-200 active:scale-90 hover:shadow-xl"
      >
        <Plus size={24} strokeWidth={2} />
      </button>
      {isOpen && <PostModal coupleId={coupleId} onClose={() => setIsOpen(false)} onPostCreated={onPostCreated} />}
    </>
  )
}