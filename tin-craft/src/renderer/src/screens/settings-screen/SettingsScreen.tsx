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
import {
  setIsBusy,
  setProgress,
  setStatus,
  useIsBusy,
  useIsPlaying,
  useProgress,
  useStatus
} from '../play-screen/model/play-screen.store'
import { ProgressBar } from '@renderer/components'

const MEMORY_OPTIONS = ['2G', '3G', '4G', '6G', '8G']

export const SettingsScreen: FC = () => {
  const isBusy = useIsBusy()
  const isPlaying = useIsPlaying()
  const [deleting, setDeleting] = useState(false)
  const [deletingState, setDeletingState] = useState(false)
  const progress = useProgress()
  const status = useStatus()

  const currentMemory = useMemory()
  const fullScreen = useFullScreen()

  const [resetClientConfirm, setResetClientConfirm] = useState(false)

  const handleHardReset = async (): Promise<void> => {
    if (isPlaying) {
      alert('Нельзя переустанавливать игру, пока она запущена!')
      return
    }
    if (isBusy) {
      alert('Дождитесь окончания текущей загрузки.')
      return
    }

    setDeleting(true)
    setDeletingState(true)
    setIsBusy(true)
    setStatus('Удаление файлов игры...')
    setProgress(0)

    try {
      const unsub = window.api.onLaunchProgress((data) => {
        setStatus(data.status)
      })

      await window.api.hardReset()

      unsub()
      setStatus("Файлы удалены. Нажмите 'ИГРАТЬ' для скачивания.")
      setProgress(0)
    } catch (e) {
      console.error(e)
      setStatus('Ошибка при удалении файлов.')
    } finally {
      setIsBusy(false)
      setDeleting(false)
    }
  }

  if (deletingState) {
    return (
      <div className={styles.screen}>
        <h3 className={styles.title}>Настройки</h3>
        <div className={styles.content}>
          <span>Удаление файлов игры...</span>
          <div>
            <ProgressBar progress={progress} status={status} />
          </div>
          <div>
            <SettingsButton disabled={deleting} onClick={() => setDeletingState(false)}>
              {deleting ? 'Удаление...' : 'Назад'}
            </SettingsButton>
          </div>
        </div>
      </div>
    )
  }

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
                  style={{ background: '#e74c3c', color: '#fff' }}
                  onClick={() => {
                    setResetClientConfirm(false)
                    handleHardReset()
                  }}
                >
                  Да
                </SettingsButton>
                <SettingsButton onClick={() => setResetClientConfirm(false)}>Нет</SettingsButton>
              </div>
            </>
          ) : (
            <SettingsButton
              onClick={() => setResetClientConfirm(true)}
              style={{ background: '#e74c3c', color: '#fff' }}
            >
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
