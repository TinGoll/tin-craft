import { useCallback, useEffect, useRef, useState } from 'react'

type UseAutoRotationReturn = {
  start: () => void
  stop: () => void
  isRunning: boolean
}

export const useAutoRotation = (callback: () => void, delay: number): UseAutoRotationReturn => {
  const savedCallback = useRef(callback)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  const start = useCallback(() => {
    if (intervalRef.current) return

    intervalRef.current = setInterval(() => {
      savedCallback.current()
    }, delay)

    setIsRunning(true)
  }, [delay])

  const stop = useCallback(() => {
    if (!intervalRef.current) return

    clearInterval(intervalRef.current)
    intervalRef.current = null
    setIsRunning(false)
  }, [])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return { start, stop, isRunning }
}
