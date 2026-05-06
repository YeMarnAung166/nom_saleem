import { useEffect, useState, useRef } from 'react'
import { Calendar, Heart } from 'lucide-react'

export default function LiveCounter({ sinceDate, untilDate }) {
  const [since, setSince] = useState({ days: 0, hours: 0, minutes: 0 })
  const [until, setUntil] = useState({ days: 0, hours: 0, minutes: 0 })
  const intervalRef = useRef()

  function updateCounters() {
    const now = new Date()
    const sinceTarget = new Date(sinceDate)
    const diffSince = now - sinceTarget
    const daysSince = Math.floor(diffSince / (1000 * 60 * 60 * 24))
    const hoursSince = Math.floor((diffSince % (86400000)) / 3600000)
    const minutesSince = Math.floor((diffSince % 3600000) / 60000)
    setSince({ days: daysSince, hours: hoursSince, minutes: minutesSince })

    const untilTarget = new Date(untilDate)
    const diffUntil = untilTarget - now
    if (diffUntil <= 0) {
      setUntil({ days: 0, hours: 0, minutes: 0 })
    } else {
      const daysUntil = Math.floor(diffUntil / (1000 * 60 * 60 * 24))
      const hoursUntil = Math.floor((diffUntil % 86400000) / 3600000)
      const minutesUntil = Math.floor((diffUntil % 3600000) / 60000)
      setUntil({ days: daysUntil, hours: hoursUntil, minutes: minutesUntil })
    }
  }

  useEffect(() => {
    updateCounters()
    intervalRef.current = setInterval(updateCounters, 60000)
    return () => clearInterval(intervalRef.current)
  }, [sinceDate, untilDate])

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-pink-100 dark:border-gray-700">
        <div className="flex items-center gap-2 text-pink-500 mb-2">
          <Heart size={20} />
          <span className="text-sm font-medium">Since</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(sinceDate).toLocaleDateString()}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
          {since.days} <span className="text-sm font-normal">days</span>
        </p>
        <p className="text-xs text-gray-500">{since.hours}h {since.minutes}m</p>
      </div>
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-purple-100 dark:border-gray-700">
        <div className="flex items-center gap-2 text-purple-500 mb-2">
          <Calendar size={20} />
          <span className="text-sm font-medium">Until</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(untilDate).toLocaleDateString()}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
          {until.days} <span className="text-sm font-normal">days</span>
        </p>
        <p className="text-xs text-gray-500">{until.hours}h {until.minutes}m</p>
      </div>
    </div>
  )
}