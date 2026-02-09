import { FC, useState } from 'react'
import styles from './Form.module.css'
import { Input } from '@renderer/components'
import { AiFillSkin } from 'react-icons/ai'
import { FaLock } from 'react-icons/fa6'
import { useLogin, useRegister } from '../api'
import { useAuthActions } from '../selectors'

export const RegisterForm: FC = () => {
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')

  const {
    isLoading: isRegisterLoading,
    trigger: registerTrigger,
    isError: isRegisterError
  } = useRegister()
  const { login } = useAuthActions()

  const { isLoading: isLoginLoading, trigger: loginTrigger } = useLogin()

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    try {
      const result = await registerTrigger({ username: nickname, password })
      if (!result) {
        throw new Error('Registration failed')
      }
      // Optionally, log in the user immediately after registration
      const loginResult = await loginTrigger({ username: nickname, password })

      if (!loginResult) {
        throw new Error('Login after registration failed')
      }
      login(nickname, loginResult.accessToken)
    } catch (error) {
      console.error('Register error:', error)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Регистрация аккаунта</h2>
      {(isRegisterLoading || isLoginLoading) && <p>Загрузка...</p>}
      <div className={styles.inputs}>
        <Input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
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
      {isRegisterError && <p className={styles.error}>Ошибка регистрации</p>}

      <button type="submit">Зарегистрироваться</button>
    </form>
  )
}
