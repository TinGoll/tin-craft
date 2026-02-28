import { FC, useEffect, useState } from 'react'
import styles from './Logger.module.css'

export const Logger: FC = () => {
  const [loggs, setLoggs] = useState<string[]>([])
  useEffect(() => {
    window.api.onMainLog((msg) => {
      setLoggs((prev) => [...prev, msg])
    })

    return () => {
      // Cleanup if needed
    }
  }, [])

  return (
    <div className={styles.logger}>
      <h3>Logger</h3>
      {loggs.map((msg, i) => (
        <div className={styles.logEntry} key={i}>
          {msg}
        </div>
      ))}
    </div>
  )
}
