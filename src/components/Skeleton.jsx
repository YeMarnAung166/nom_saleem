export function PostSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  )
}

export function PhotoSkeleton() {
  return <div className="rounded-lg w-full h-40 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
}