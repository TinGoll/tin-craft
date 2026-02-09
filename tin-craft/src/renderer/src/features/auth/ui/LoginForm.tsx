import { FC, useState } from 'react'
import styles from './Form.module.css'
import { Input } from '../../../components/inputs'
import { AiFillSkin } from 'react-icons/ai'
import { FaLock } from 'react-icons/fa6'
import { useLogin } from '../api'
import { useAuthActions } from '../selectors'

export const LoginForm: FC = () => {
  const { login } = useAuthActions()

  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')

  const { isLoading, trigger, isError } = useLogin()

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

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
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Вход в аккаунт</h2>
      {isLoading && <p>Загрузка...</p>}
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
      </div>
      {isError && <p className={styles.error}>Неверные учетные данные</p>}

      <button type="submit">Войти</button>
    </form>
  )
}
