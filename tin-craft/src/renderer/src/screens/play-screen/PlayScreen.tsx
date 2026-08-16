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
import { Hint, ProgressBar } from '@renderer/components'
import { useMinecraftHints } from './hooks/useMinecraftHints'
import { useServerAvailability } from '@renderer/hooks'

export const PlayScreen: FC = () => {
  const isServerAvailable = useServerAvailability()
  const { logout, setHasFirstLaunch } = useAuthActions()
  const nickname = useAuthUser()
  const isBusy = useIsBusy()
  const status = useStatus()
  const hintText = useHintText()
  const progress = useProgress()
  const isPlaying = useIsPlaying()

  const { start } = useMinecraftHints()

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null

    if (isPlaying) {
      timeout = setTimeout(() => {
        // window.api?.close()
      }, 10000)
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [isPlaying])

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

  const handlePlay = async (offline = false): Promise<void> => {
    if (!nickname) {
      setStatus('Ошибка: пользователь не найден')
      return
    }
    start()

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
      if (!offline) {
        setStatus('Проверка обновлений...')
        const unsubUpdate = window.api.onUpdateProgress((data) => {
          setStatus(data.status)
          setProgress(data.percent)
        })
        await window.api.updateGame()
        unsubUpdate()
      }

      // 3. ЗАПУСК
      setStatus('Инициализация запуска...')

      const unsubLaunch = window.api.onLaunchProgress((data) => {
        setStatus(data.status)
        if (data.percent >= 0) {
          setProgress(data.percent)
        }
      })

      setIsPlaying(true)

      await window.api.launchGame(javaPath, nickname, offline)
      setProgress(100)
      setStatus(offline ? 'Игра запущена в офлайн-режиме!' : 'Игра запущена! Приятной игры.')
      unsubLaunch()
      setHasFirstLaunch(true)
    } catch (error) {
      console.error('Ошибка при запуске игры:', error)
      setStatus('Ошибка при запуске игры')
    } finally {
      setIsBusy(false)
    }
  }

  const isLocked = isBusy || isPlaying
  const isCheckingServer = isServerAvailable === null
  const offline = isServerAvailable === false

  return (
    <div className={styles.screen}>
      <div className={styles.inventory}>
        <div className={styles.feedback}>
          <h2 className={styles.user}>
            Привет <span>{nickname}</span>!
          </h2>
          <Hint className={styles.hint} text={hintText} disableTypingEffect={!hintText} />
          <ProgressBar progress={progress} status={status} />
        </div>
        <div className={styles.buttons}>
          <Button
            style={{ flex: 1 }}
            loading={isLocked || isCheckingServer}
            variant={offline ? 'secondary' : 'primary'}
            onClick={() => handlePlay(offline)}
          >
            {isCheckingServer
              ? 'Проверка...'
              : isLocked
                ? 'Загрузка...'
                : offline
                  ? 'Офлайн'
                  : 'Играть'}
          </Button>
          <Button disabled={isLocked} variant="danger" onClick={logout}>
            Выход
          </Button>
        </div>
      </div>
    </div>
  )
}
