import { FC } from 'react'
import styles from './SettingsScreen.module.css'
import { setMemory, useMemory } from '@renderer/features/memory-manager'
import { MemoryButton } from './ui'
import { Button } from '@renderer/components/buttons'
import { setShowSettingsScreen } from '@renderer/features/settings'

const MEMORY_OPTIONS = ['2G', '3G', '4G', '6G', '8G']

export const SettingsScreen: FC = () => {
  const currentMemory = useMemory()
  return (
    <div className={styles.screen}>
      <h3>Настройки</h3>

      <div className={styles.content}>
        <div className={styles.memorySettings}>
          <h3>Память</h3>
          <span>Текущая память: {currentMemory}</span>
          <div>
            {MEMORY_OPTIONS.map((option) => (
              <MemoryButton
                disabled={option === currentMemory}
                key={option}
                onClick={() => setMemory(option)}
              >
                {option}
              </MemoryButton>
            ))}
          </div>
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
