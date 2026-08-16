import { useEffect, useState } from 'react'

export const useServerAvailability = (): boolean | null => {
  const [isServerAvailable, setIsServerAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    let active = true

    const checkServer = async (): Promise<void> => {
      const available = await window.api.checkServerAvailability(import.meta.env.VITE_API_URL)
      if (active) {
        setIsServerAvailable(available)
      }
    }

    checkServer()
    const interval = setInterval(checkServer, 30000)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  return isServerAvailable
}
