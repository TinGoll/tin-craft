import { FC, useState } from 'react'
import styles from './SettingsScreen.module.css'
import { SettingsButton } from './ui'
import { Button } from '@renderer/components/buttons'
import {
  setFullScreen,
  setMemory,
  setShowSettingsScreen,
  useFullScreen,
  useMemory
} from '@renderer/features/settings'

const MEMORY_OPTIONS = ['2G', '3G', '4G', '6G', '8G']

export const SettingsScreen: FC = () => {
  const currentMemory = useMemory()
  const fullScreen = useFullScreen()

  const [resetClientConfirm, setResetClientConfirm] = useState(false)

  return (
    <div className={styles.screen}>
      <h3 className={styles.title}>Настройки</h3>
      <div className={styles.content}>
        <span>Текущая выделенная память: {currentMemory}</span>
        <div>
          {MEMORY_OPTIONS.map((option) => (
            <SettingsButton
              disabled={option === currentMemory}
              key={option}
              onClick={() => setMemory(option)}
            >
              {option}
            </SettingsButton>
          ))}
        </div>
        <div className={styles.fullScreenToggle}>
          <p>Полноэкранный режим</p>
          <SettingsButton
            style={{ width: 160 }}
            toggled={fullScreen}
            onClick={() => setFullScreen(!fullScreen)}
          >
            {fullScreen ? 'Включено' : 'Выключено'}
          </SettingsButton>
        </div>
        <div className={styles.resetClient}>
          {resetClientConfirm ? (
            <>
              <span>Выполнить сброс?</span>
              <div>
                <SettingsButton
                  onClick={() => {
                    setResetClientConfirm(false)
                  }}
                >
                  Да
                </SettingsButton>
                <SettingsButton onClick={() => setResetClientConfirm(false)}>Нет</SettingsButton>
              </div>
            </>
          ) : (
            <SettingsButton onClick={() => setResetClientConfirm(true)}>
              Сбросить клиент
            </SettingsButton>
          )}
        </div>
      </div>
      <div className={styles.buttons}>
        <Button variant="primary" onClick={() => setShowSettingsScreen(false)}>
          Готово
        </Button>
      </div>
    </div>
  )
}
