/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { FC, useEffect, useRef, useState } from 'react'
import styles from './ProgressBar.module.css'

type ProgressBarProps = {
  progress: number
}

export const ProgressBar: FC<ProgressBarProps> = ({ progress }) => {
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

  return (
    <div className={styles.wrapper}>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${displayedProgress}%` }} />
        <span className={styles.label}>{percent}%</span>
      </div>
    </div>
  )
}
