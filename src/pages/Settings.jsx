import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'
import ShareLinkModal from '../components/ShareLinkModal'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, signOut } = useAuth()
  const { dark, setDark } = useTheme()
  const [couple, setCouple] = useState(null)
  const [sinceDate, setSinceDate] = useState('')
  const [untilDate, setUntilDate] = useState('')
  const [shareLinks, setShareLinks] = useState([])
  const [showShareModal, setShowShareModal] = useState(false)
  const [newLink, setNewLink] = useState('')

  useEffect(() => {
    fetchCouple()
    fetchShareLinks()
  }, [user])

  async function fetchCouple() {
    const { data } = await supabase
      .from('couples')
      .select('*')
      .or(`creator1_id.eq.${user.id},creator2_id.eq.${user.id}`)
      .single()
    setCouple(data)
    if (data) {
      setSinceDate(data.since_date)
      setUntilDate(data.until_date)
    }
  }

  async function fetchShareLinks() {
    if (!couple) return
    const { data } = await supabase
      .from('share_links')
      .select('*')
      .eq('couple_id', couple.id)
    setShareLinks(data || [])
  }

  async function updateDates() {
    const { error } = await supabase
      .from('couples')
      .update({ since_date: sinceDate, until_date: untilDate })
      .eq('id', couple.id)
    if (error) toast.error(error.message)
    else toast.success('Dates updated')
  }

  async function createShareLink(postId = null) {
    const token = Math.random().toString(36).substring(2, 10)
    const { error } = await supabase
      .from('share_links')
      .insert([{ couple_id: couple.id, post_id: postId, token, active: true }])
    if (error) toast.error(error.message)
    else {
      const link = `${window.location.origin}/${postId ? `s/${token}` : `feed/${token}`}`
      setNewLink(link)
      setShowShareModal(true)
      fetchShareLinks()
    }
  }

  async function revokeLink(id) {
    const { error } = await supabase
      .from('share_links')
      .update({ active: false })
      .eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Link revoked')
      fetchShareLinks()
    }
  }

  if (!couple) return <div className="p-4 dark:text-white">Loading...</div>

  return (
    <div className="pb-20 p-4 space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Settings</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="font-semibold dark:text-white">Important Dates</h2>
        <label className="block mt-2 dark:text-gray-300">Since date</label>
        <input type="date" value={sinceDate} onChange={e => setSinceDate(e.target.value)} className="border dark:border-gray-700 dark:bg-gray-900 dark:text-white p-2 rounded w-full" />
        <label className="block mt-2 dark:text-gray-300">Until date</label>
        <input type="date" value={untilDate} onChange={e => setUntilDate(e.target.value)} className="border dark:border-gray-700 dark:bg-gray-900 dark:text-white p-2 rounded w-full" />
        <button onClick={updateDates} className="mt-4 bg-pink-600 text-white px-4 py-2 rounded">Save Dates</button>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="font-semibold dark:text-white">Share Links</h2>
        <div className="flex flex-wrap gap-2 mt-2">
          <button onClick={() => createShareLink()} className="bg-green-600 text-white px-4 py-2 rounded">Share Entire Feed</button>
          <button onClick={() => { const postId = prompt('Enter post ID (from URL)'); if(postId) createShareLink(postId); }} className="bg-blue-600 text-white px-4 py-2 rounded">Share Single Post</button>
        </div>
        <div className="mt-4 space-y-2">
          {shareLinks.map(link => (
            <div key={link.id} className="border dark:border-gray-700 p-2 rounded flex justify-between items-center">
              <span className="text-sm truncate dark:text-white">{link.post_id ? `Post: ${link.post_id.slice(0,8)}` : 'Full Feed'} - {link.active ? 'Active' : 'Revoked'}</span>
              {link.active && <button onClick={() => revokeLink(link.id)} className="bg-red-500 text-white px-2 py-1 rounded text-sm">Revoke</button>}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="font-semibold dark:text-white">Appearance</h2>
        <button onClick={() => setDark(!dark)} className="mt-2 bg-gray-200 dark:bg-gray-700 dark:text-white px-4 py-2 rounded">
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
      <button onClick={signOut} className="bg-gray-600 text-white px-4 py-2 rounded w-full">Logout</button>
      <BottomNav />
      {showShareModal && <ShareLinkModal link={newLink} onClose={() => setShowShareModal(false)} />}
    </div>
  )
}