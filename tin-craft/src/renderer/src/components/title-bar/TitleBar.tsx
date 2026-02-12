import { FC, useEffect, useState } from 'react'
import styles from './TitleBar.module.css'
import { CloseButton, MaximizeButton, MinimizeButton } from './buttons'

export const TitleBar: FC = () => {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    window.api?.isMaximized().then(setIsMaximized)
  }, [])

  const handleMinimize = (): void => window.api?.minimize()
  const handleMaximize = (): void => {
    window.api?.maximize()
    setIsMaximized(!isMaximized)
  }
  const handleClose = (): void => window.api?.close()

  return (
    <div className={styles.titleBar2}>
      <div className={styles.title} />
      <div className={styles.windowControls}>
        <MinimizeButton onClick={handleMinimize} />
        <MaximizeButton onClick={handleMaximize} />
        <CloseButton onClick={handleClose} />
      </div>
    </div>
  )
}
