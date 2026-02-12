import { FC, useEffect } from 'react'
import styles from './PlayScreen.module.css'
import { useAuthActions, useAuthUser } from '@renderer/features/auth'
import { Button } from '@renderer/components/buttons/Button'
import {
  setIsBusy,
  setIsPlaying,
  setProgress,
  setStatus,
  useHintText,
  useIsBusy,
  useIsPlaying,
  useProgress,
  useStatus
} from './model/play-screen.store'
import { ProgressBar } from '@renderer/components/progress-bar'
import { StatusBar } from '@renderer/components/status-bar'
import { Hint } from '@renderer/components/hint'

export const PlayScreen: FC = () => {
  const { logout } = useAuthActions()
  const nickname = useAuthUser()
  const isBusy = useIsBusy()
  const status = useStatus()
  const hintText = useHintText()
  const progress = useProgress()
  const isPlaying = useIsPlaying()

  useEffect(() => {
    const unsubGameClosed = window.api.onGameClosed((data) => {
      console.log('Игра закрылась, код:', data.code)
      setIsPlaying(false)
      setStatus(data.code === 0 ? 'Игра завершена' : 'Игра крашнулась/закрыта')
      setProgress(0)
    })

    return () => {
      unsubGameClosed()
    }
  }, [])

  const handlePlay = async (): Promise<void> => {
    if (!nickname) {
      setStatus('Ошибка: пользователь не найден')
      return
    }

    if (isBusy || isPlaying) {
      return
    }

    setIsBusy(true)
    setProgress(0)

    try {
      // 1. JAVA
      setStatus('Проверка Java...')
      let javaPath = await window.api.checkJava()

      if (!javaPath) {
        setStatus('Скачивание Java 21...')
        const unsubJava = window.api.onJavaProgress((data) => {
          setStatus(data.status)
          setProgress(data.percent)
        })
        javaPath = await window.api.installJava()
        unsubJava()
      }

      // 2. ОБНОВЛЕНИЯ
      setStatus('Проверка обновлений...')
      const unsubUpdate = window.api.onUpdateProgress((data) => {
        setStatus(data.status)
        setProgress(data.percent)
      })
      await window.api.updateGame()
      unsubUpdate()

      // 3. ЗАПУСК
      setStatus('Инициализация запуска...')

      const unsubLaunch = window.api.onLaunchProgress((data) => {
        setStatus(data.status)
        if (data.percent >= 0) {
          setProgress(data.percent)
        }
      })

      setIsPlaying(true)

      await window.api.launchGame(javaPath, nickname)
      setProgress(100)
      setStatus('Игра запущена! Приятной игры.')
      unsubLaunch()
    } catch (error) {
      console.error('Ошибка при запуске игры:', error)
      setStatus('Ошибка при запуске игры')
    } finally {
      setIsBusy(false)
    }
  }

  const isLocked = isBusy || isPlaying

  return (
    <div className={styles.screen}>
      <div className={styles.inventory}>
        <div className={styles.feedback}>
          <StatusBar className={styles.statusBar} text={status} />
          <Hint className={styles.hint} text={hintText} disableTypingEffect={!hintText} />
          <ProgressBar progress={progress} />
        </div>
        <div className={styles.buttons}>
          <Button style={{ flex: 1 }} loading={isLocked} variant="primary" onClick={handlePlay}>
            {isLocked ? 'Загрузка...' : 'Играть'}
          </Button>
          <Button disabled={isLocked} variant="danger" onClick={logout}>
            Выход
          </Button>
        </div>
      </div>
    </div>
  )
}
