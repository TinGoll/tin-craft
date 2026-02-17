/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { FC, useEffect, useRef, useState } from 'react'
import styles from './ProgressBar.module.css'
import { StatusBar } from '../status-bar'

type ProgressBarProps = {
  progress: number
  status?: string
  visible?: boolean
}

export const ProgressBar: FC<ProgressBarProps> = ({ progress, status, visible = true }) => {
  const [displayedProgress, setDisplayedProgress] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const target = Math.min(100, Math.max(0, progress))

    const animate = () => {
      setDisplayedProgress((prev) => {
        const diff = target - prev

        if (Math.abs(diff) < 0.1) {
          return target
        }

        return prev + diff * 0.08
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [progress])

  const percent = Math.round(displayedProgress)

  if (!visible) {
    return null
  }

  return (
    <div className={styles.wrapper}>
      {status && <StatusBar className={styles.status} text={status} />}
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${displayedProgress}%` }} />
        <span className={styles.label}>{percent}%</span>
      </div>
    </div>
  )
}
