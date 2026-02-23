import { FC } from 'react'
import styles from './StatusBar.module.css'
import clsx from 'clsx'

interface Props {
  text: string
  className?: string
}

export const StatusBar: FC<Props> = ({ text, className }) => {
  return (
    <div className={clsx(styles.wrapper, className)}>
      <span className={styles.text}>{text}</span>
    </div>
  )
}
