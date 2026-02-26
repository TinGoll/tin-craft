import { FC, useEffect, useState } from 'react'
import styles from './TitleBar.module.css'
import { CloseButton, MaximizeButton, MinimizeButton } from './buttons'
import { Logo } from '../logo'
import { toggleSettingsScreen } from '@renderer/features/settings'
import { SettingsButton } from './buttons/SettingsButton'

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
      <div className={styles.title}>
        <Logo />
      </div>
      <div className={styles.windowControls}>
        <SettingsButton
          style={{
            marginRight: 32
          }}
          onClick={toggleSettingsScreen}
        />
        <MinimizeButton onClick={handleMinimize} />
        <MaximizeButton onClick={handleMaximize} />
        <CloseButton onClick={handleClose} />
      </div>
    </div>
  )
}
