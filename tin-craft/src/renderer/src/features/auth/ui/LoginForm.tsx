import { FC, useState } from 'react'
import styles from './Form.module.css'
import { Input } from '../../../components/inputs'
import { AiFillSkin } from 'react-icons/ai'
import { FaLock } from 'react-icons/fa6'
import { useLogin } from '../api'
import { useAuthActions } from '../selectors'
import { Button } from '@renderer/components/buttons'
import { AuthScreenMode, setScreenMode } from '@renderer/screens'

export const LoginForm: FC = () => {
  const { login } = useAuthActions()

  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')

  const { isLoading, trigger, isError, error } = useLogin()

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!loginValue || !password) {
      return
    }

    try {
      const result = await trigger({ username: loginValue, password })
      if (!result) {
        throw new Error('Invalid login or password')
      }
      login(result.username, result.accessToken)
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
        {isError && <p className={styles.error}>{error || 'Неверные учетные данные'}</p>}
      </div>
      <div className={styles.buttons}>
        <Button style={{ flex: 1 }} variant="primary" type="submit" disabled={isLoading}>
          Войти
        </Button>
        <Button variant="secondary" onClick={() => setScreenMode(AuthScreenMode.register)}>
          Регистрация
        </Button>
      </div>
    </form>
  )
}
