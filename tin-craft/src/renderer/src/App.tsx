/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useState, useEffect, JSX } from 'react'

// Типы данных состояния
interface UserProfile {
  username: string
  uuid: string
  accessToken: string
}
function App(): JSX.Element {
  // --- Состояния UI ---
  const [view, setView] = useState<'loading' | 'login' | 'dashboard'>('loading')

  // --- Данные пользователя ---
  const [user, setUser] = useState<UserProfile | null>(null)

  // --- Данные формы входа ---
  const [loginInput, setLoginInput] = useState('')
  const [passInput, setPassInput] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // --- Состояния запуска игры ---
  const [status, setStatus] = useState('Готов к запуску')
  const [progress, setProgress] = useState(0)
  const [isLaunching, setIsLaunching] = useState(false)

  // 1. При загрузке приложения проверяем сессию
  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await window.api.validateSession()
        if (session) {
          // Сессия валидна — пускаем в дашборд
          setUser({
            username: session.selectedProfile.name,
            uuid: session.selectedProfile.id,
            accessToken: session.accessToken
          })
          setView('dashboard')
        } else {
          // Сессии нет — показываем вход
          setView('login')
        }
      } catch (e) {
        console.error(e)
        setView('login')
      }
    }
    initAuth()
  }, [])

  // 2. Обработчик кнопки "Войти"
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setIsLoggingIn(true)

    try {
      const response = await window.api.login(loginInput, passInput)

      setUser({
        username: response.selectedProfile.name,
        uuid: response.selectedProfile.id,
        accessToken: response.accessToken
      })

      setView('dashboard')
      // Очищаем пароль из стейта для безопасности
      setPassInput('')
    } catch (error: any) {
      console.error(error)
      // Ошибка приходит из Main process, текст может быть в error.message
      setLoginError('Неверный логин или пароль')
    } finally {
      setIsLoggingIn(false)
    }
  }

  // 3. Обработчик кнопки "Выйти"
  const handleLogout = async () => {
    await window.api.logout()
    setUser(null)
    setView('login')
    setStatus('Готов к запуску')
    setProgress(0)
  }

  // 4. Обработчик кнопки "ИГРАТЬ"
  const handlePlay = async () => {
    if (isLaunching || !user) return
    setIsLaunching(true)
    setStatus('Подготовка...')

    try {
      // А) Проверка Java
      let javaPath = await window.api.checkJava()
      if (!javaPath) {
        setStatus('Скачивание Java 21...')
        const removeSub = window.api.onJavaProgress((data) => {
          setStatus(data.status)
          setProgress(data.percent)
        })
        javaPath = await window.api.installJava()
        removeSub()
      }

      // Б) Обновление (Моды, Конфиги, Инжектор)
      setStatus('Проверка обновлений...')
      const removeUpdateSub = window.api.onUpdateProgress((data) => {
        setStatus(data.status)
        setProgress(data.percent)
      })
      await window.api.updateGame()
      removeUpdateSub()

      // В) Запуск
      setStatus('Запуск игры...')
      setProgress(100)

      // Передаем полные данные пользователя для Yggdrasil
      await window.api.launchGame(javaPath, user.username, user.uuid, user.accessToken)

      setStatus('Игра запущена.')
      // window.close(); // Можно закрыть лаунчер
    } catch (error) {
      console.error(error)
      setStatus('Ошибка запуска! См. консоль')
    } finally {
      setIsLaunching(false)
    }
  }

  // --- РЕНДЕРИНГ ---

  if (view === 'loading') {
    return (
      <div style={styles.container}>
        <h2>Загрузка...</h2>
      </div>
    )
  }

  if (view === 'login') {
    return (
      <div style={styles.container}>
        <h1>Вход в Лаунчер</h1>
        <form onSubmit={handleLoginSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Логин / Email"
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            style={styles.input}
            required
          />
          {/* <input
            type="password"
            placeholder="Пароль"
            value={passInput}
            onChange={(e) => setPassInput(e.target.value)}
            style={styles.input}
            required
          /> */}

          {loginError && <p style={{ color: 'red' }}>{loginError}</p>}

          <button type="submit" disabled={isLoggingIn} style={styles.button}>
            {isLoggingIn ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    )
  }

  // Dashboard View
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.userInfo}>
          {/* Ссылка на голову скина (стандартный URL Crafatar или твой скин-сервер) */}
          <img
            src={`https://minotar.net/helm/${user?.username}/50.png`}
            alt="Skin"
            style={{ borderRadius: '5px', marginRight: '10px' }}
          />
          <div>
            <h3>{user?.username}</h3>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div style={styles.content}>
        <h2>Minecraft 1.21.1 + NeoForge</h2>

        <div style={styles.statusBox}>
          <p>{status}</p>
          {progress > 0 && <progress value={progress} max="100" style={{ width: '100%' }} />}
        </div>

        <button
          onClick={handlePlay}
          disabled={isLaunching}
          style={{ ...styles.button, height: '60px', fontSize: '24px' }}
        >
          {isLaunching ? 'ЗАГРУЗКА...' : 'ИГРАТЬ'}
        </button>
      </div>
    </div>
  )
}

// Простые стили для примера (лучше вынести в CSS)
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontFamily: 'Segoe UI, sans-serif',
    // backgroundColor: '#1e1e1e',
    color: 'white'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '300px'
  },
  input: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #444',
    backgroundColor: '#333',
    color: 'white'
  },
  button: {
    padding: '10px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#4caf50',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    display: 'flex',
    justifyContent: 'space-between'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    padding: '10px',
    borderRadius: '8px'
  },
  logoutBtn: {
    fontSize: '12px',
    background: 'none',
    border: '1px solid #666',
    color: '#aaa',
    cursor: 'pointer',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  content: {
    textAlign: 'center',
    width: '100%',
    maxWidth: '400px'
  },
  statusBox: {
    margin: '20px 0',
    minHeight: '40px'
  }
}

export default App
