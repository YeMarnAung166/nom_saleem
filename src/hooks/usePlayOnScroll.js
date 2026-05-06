import { useEffect, useRef } from 'react'

let currentlyPlaying = null

export function usePlayOnScroll() {
  const videoRef = useRef(null)

  useEffect(() => {
    const handleVisibility = (entries) => {
      entries.forEach((entry) => {
        const video = videoRef.current
        if (!video) return

        if (entry.isIntersecting) {
          if (currentlyPlaying && currentlyPlaying !== video) {
            currentlyPlaying.pause()
          }
          video.play().catch(() => {})
          currentlyPlaying = video
        } else {
          if (currentlyPlaying === video) {
            video.pause()
            currentlyPlaying = null
          }
        }
      })
    }

    const observer = new IntersectionObserver(handleVisibility, { threshold: 0.5 })
    const currentVideo = videoRef.current
    if (currentVideo) observer.observe(currentVideo)

    return () => {
      if (currentVideo) observer.unobserve(currentVideo)
    }
  }, [])

  return videoRef
}