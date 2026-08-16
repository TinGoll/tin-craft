import { FC, useEffect, useRef, useState } from 'react'
import styles from './Form.module.css'
import { Input } from '../../../components/inputs'
import { AiFillSkin } from 'react-icons/ai'
import { FaLock } from 'react-icons/fa6'
import { useLogin } from '../api'
import { useAuthActions, useLastSuccessLoginUsers } from '../selectors'
import { Button } from '@renderer/components/buttons'
import { AuthScreenMode, setScreenMode } from '@renderer/screens'
import { LAST_SUCCESS_LOGIN_USERS_KEY } from '../types'
import { useServerAvailability } from '@renderer/hooks'

export const LoginForm: FC = () => {
  const { login, addSuccessLoginUser } = useAuthActions()
  const lastSuccessLoginUsers = useLastSuccessLoginUsers()
  const isServerAvailable = useServerAvailability()

  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')
  const [offlineError, setOfflineError] = useState<string | null>(null)
  const autofilledRef = useRef(false)

  useEffect(() => {
    if (autofilledRef.current) return

    window.api.store.get<Record<string, string>>(LAST_SUCCESS_LOGIN_USERS_KEY).then((users) => {
      if (!users) return

      const userData = users[loginValue.toLowerCase()]
      if (userData) {
        setPassword(userData)
        autofilledRef.current = true
      }
    })
  }, [loginValue])

  const { isLoading, trigger, isError, error } = useLogin()

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!loginValue || !password) {
      return
    }

    setOfflineError(null)

    if (isServerAvailable === false) {
      const savedPassword = lastSuccessLoginUsers[loginValue.toLowerCase()]
      if (!savedPassword || savedPassword !== password) {
        setOfflineError('Офлайн-вход доступен только для ранее авторизованного аккаунта')
        return
      }

      await login(loginValue, 'offline_token')
      return
    }

    try {
      const result = await trigger({ username: loginValue, password })
      if (!result) {
        throw new Error('Invalid login or password')
      }
      login(result.username, result.accessToken)
      addSuccessLoginUser(result.username, password)
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Вход в аккаунт</h2>
      <div className={styles.inputs}>
        <Input
          value={loginValue}
          onChange={(e) => setLoginValue(e.target.value)}
          placeholder="Никнейм"
          name="username"
          autoComplete="username"
          icon={<AiFillSkin />}
        />
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          type="password"
          name="password"
          autoComplete="current-password"
          icon={<FaLock />}
        />
        {isServerAvailable === false && (
          <p className={styles.notice}>Сервер недоступен. Доступен вход в сохранённый аккаунт.</p>
        )}
        {(offlineError || isError) && (
          <p className={styles.error}>{offlineError || error || 'Неверные учетные данные'}</p>
        )}
      </div>
      <div className={styles.buttons}>
        <Button
          style={{ flex: 1 }}
          variant={isServerAvailable === false ? 'secondary' : 'primary'}
          type="submit"
          loading={isLoading || isServerAvailable === null}
        >
          {isServerAvailable === null
            ? 'Проверка сервера...'
            : isServerAvailable
              ? 'Войти'
              : 'Войти офлайн'}
        </Button>
        <Button
          variant="secondary"
          type="button"
          disabled={isServerAvailable !== true}
          onClick={() => setScreenMode(AuthScreenMode.register)}
        >
          Регистрация
        </Button>
      </div>
    </form>
  )
}
