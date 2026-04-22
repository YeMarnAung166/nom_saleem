import { formatDistanceToNow, format } from 'date-fns'

export function formatRelative(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatFull(date) {
  return format(new Date(date), 'PPPpp')
}