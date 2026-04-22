import { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ShareLinkModal({ link, onClose }) {
  const [copied, setCopied] = useState(false)
  const copyToClipboard = () => {
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold dark:text-white">Share Link</h3>
          <button onClick={onClose} className="dark:text-white"><X /></button>
        </div>
        <p className="text-sm break-all bg-gray-100 dark:bg-gray-700 p-2 rounded my-4 dark:text-white">{link}</p>
        <button onClick={copyToClipboard} className="w-full bg-pink-600 text-white py-2 rounded flex items-center justify-center gap-2">
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  )
}