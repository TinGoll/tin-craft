/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX, useState } from 'react'

function App(): JSX.Element {
  const [status, setStatus] = useState<string>('Готов к игре')
  const [progress, setProgress] = useState<number>(0)
  const [isBusy, setIsBusy] = useState<boolean>(false)
  const [username, setUsername] = useState<string>('Player')

  const handlePlay = async () => {
    if (isBusy) return
    setIsBusy(true)

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
        // Если MCLC присылает 0% или 100%, обновляем бар.
        // Если это просто смена текста статуса (например при установке Forge), бар держим полным.
        if (data.percent >= 0) {
          setProgress(data.percent)
        }
      })

      await window.api.launchGame(javaPath, username)
      setProgress(100)
      setStatus('Игра запущена! Приятной игры.')
      unsubLaunch()
    } catch (error) {
      console.error(error)
      setStatus('Ошибка запуска (см. консоль)')
    } finally {
      setIsBusy(false)
    }
  }

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

      <button onClick={handlePlay} disabled={isBusy}>
        {isBusy ? 'Загрузка...' : 'ИГРАТЬ'}
      </button>
    </div>
  )
}

export default App
