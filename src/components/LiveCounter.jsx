import { useEffect, useState, useRef } from 'react'

export default function LiveCounter({ sinceDate, untilDate }) {
  const [since, setSince] = useState({ days: 0, hours: 0, minutes: 0 })
  const [until, setUntil] = useState({ days: 0, hours: 0, minutes: 0 })
  const intervalRef = useRef()

  function updateCounters() {
    const now = new Date()
    // Since counter
    const sinceTarget = new Date(sinceDate)
    const diffSince = now - sinceTarget
    const daysSince = Math.floor(diffSince / (1000 * 60 * 60 * 24))
    const hoursSince = Math.floor((diffSince % (86400000)) / 3600000)
    const minutesSince = Math.floor((diffSince % 3600000) / 60000)
    setSince({ days: daysSince, hours: hoursSince, minutes: minutesSince })

    // Until counter
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 space-y-4">
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Since {new Date(sinceDate).toLocaleDateString()}</p>
        <p className="text-2xl font-bold dark:text-white">{since.days} days, {since.hours} hr, {since.minutes} min</p>
      </div>
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Until {new Date(untilDate).toLocaleDateString()}</p>
        <p className="text-2xl font-bold dark:text-white">{until.days} days, {until.hours} hr, {until.minutes} min</p>
      </div>
    </div>
  )
}