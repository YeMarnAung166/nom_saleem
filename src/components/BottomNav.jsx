import { NavLink } from 'react-router-dom'
import { Home, StickyNote, Image, Video, Settings } from 'lucide-react'

export default function BottomNav() {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/notes', icon: StickyNote, label: 'Notes' },
    { to: '/photos', icon: Image, label: 'Photos' },
    { to: '/videos', icon: Video, label: 'Videos' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-around py-2 pb-safe z-50">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center p-2 ${isActive ? 'text-pink-500' : 'text-gray-500 dark:text-gray-400'}`
          }
        >
          <Icon size={24} />
          <span className="text-xs mt-1">{label}</span>
        </NavLink>
      ))}
    </div>
  )
}