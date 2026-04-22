import { Heart } from 'lucide-react'

export default function EmptyState({ type }) {
  const messages = {
    notes: "No notes yet. Tap + to write your first memory.",
    photos: "No photos yet. Capture a moment together.",
    videos: "No videos yet. Record something special.",
    home: "Start by creating your first memory!"
  }
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
      <Heart size={48} strokeWidth={1} />
      <p className="mt-4 text-center">{messages[type] || "Nothing here yet"}</p>
    </div>
  )
}