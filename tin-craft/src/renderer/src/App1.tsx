/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX, useEffect, useState } from 'react'

function App1(): JSX.Element {
  const [status, setStatus] = useState<string>('Готов к игре')
  const [progress, setProgress] = useState<number>(0)
  const [username, setUsername] = useState<string>('Player')

  const [isBusy, setIsBusy] = useState<boolean>(false)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  useEffect(() => {
    const unsubGameClosed = window.api.onGameClosed((data: any) => {
      console.log('Игра закрылась, код:', data.code)
      setIsPlaying(false)
      setStatus(data.code === 0 ? 'Игра завершена' : 'Игра крашнулась/закрыта')
      setProgress(0)
    })

    return () => {
      unsubGameClosed()
    }
  }, [])

  const handlePlay = async () => {
    if (isBusy || isPlaying) return

    setIsBusy(true)
    setProgress(0)

    try {
      // 1. JAVA
      setStatus('Проверка Java...')
      let javaPath = await window.api.checkJava()

      if (!javaPath) {
        setStatus('Скачивание Java 21...')
        const unsubJava = window.api.onJavaProgress((data: any) => {
          setStatus(data.status)
          setProgress(data.percent)
        })
        javaPath = await window.api.installJava()
        unsubJava()
      }

      // 2. ОБНОВЛЕНИЯ
      setStatus('Проверка обновлений...')
      const unsubUpdate = window.api.onUpdateProgress((data: any) => {
        setStatus(data.status)
        setProgress(data.percent)
      })
      await window.api.updateGame()
      unsubUpdate()

      // 3. ЗАПУСК
      setStatus('Инициализация запуска...')

      const unsubLaunch = window.api.onLaunchProgress((data: any) => {
        setStatus(data.status)
        if (data.percent >= 0) {
          setProgress(data.percent)
        }
      })

      setIsPlaying(true)

      await window.api.launchGame(javaPath, username)
      setProgress(100)
      setStatus('Игра запущена! Приятной игры.')
      unsubLaunch()
    } catch (error) {
      console.error(error)
      setStatus('Ошибка запуска!')
      setIsPlaying(false)
    } finally {
      setIsBusy(false)
    }
  }

  const isLocked = isBusy || isPlaying

  return (
    <div className="container" style={{ padding: 20 }}>
      <h1>Launcher 1.21.1</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Никнейм"
        />
      </div>

      <div style={{ marginBottom: 10, border: '1px solid #ccc', padding: 10 }}>
        <div>{status}</div>
        {isBusy && (
          <div style={{ width: '100%', background: '#eee', height: 10, marginTop: 5 }}>
            <div style={{ width: `${progress}%`, background: 'green', height: '100%' }} />
          </div>
        )}
      </div>

      <button
        onClick={handlePlay}
        disabled={isLocked}
        style={{
          padding: '10px 20px',
          cursor: isLocked ? 'not-allowed' : 'pointer',
          backgroundColor: isPlaying ? '#555' : '#4caf50',
          color: 'white'
        }}
      >
        {isBusy ? 'Подготовка...' : isPlaying ? 'В ИГРЕ' : 'ИГРАТЬ'}
      </button>
    </div>
  )
}

export default App1
