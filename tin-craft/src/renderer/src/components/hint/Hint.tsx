import { FC, useEffect, useRef, useState } from 'react'
import styles from './Hint.module.css'
import clsx from 'clsx'

interface Props {
  className?: string
  text: string
  typingSpeed?: number
  maxLines?: number
  disableTypingEffect?: boolean
}

export const Hint: FC<Props> = ({
  text,
  typingSpeed = 50,
  maxLines = 4,
  className,
  disableTypingEffect = false
}) => {
  const [visibleText, setVisibleText] = useState('')
  const indexRef = useRef(0)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    setVisibleText('')
    indexRef.current = 0

    if (disableTypingEffect) {
      setVisibleText(text)
      return
    }

    intervalRef.current = window.setInterval(() => {
      indexRef.current++

      setVisibleText(text.slice(0, indexRef.current))

      if (indexRef.current >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }, typingSpeed)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [disableTypingEffect, text, typingSpeed])

  return (
    <div
      className={clsx(styles.wrapper, className)}
      style={{ WebkitLineClamp: maxLines } as React.CSSProperties}
      title={text}
    >
      {visibleText}
      {disableTypingEffect ? null : <span className={styles.cursor} />}
    </div>
  )
}
