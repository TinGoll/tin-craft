import { FC, useState } from 'react'
import styles from './Form.module.css'
import { Input } from '@renderer/components'
import { AiFillSkin } from 'react-icons/ai'
import { FaLock } from 'react-icons/fa6'
import { useLogin, useRegister } from '../api'
import { useAuthActions } from '../selectors'
import { AuthScreenMode, setScreenMode } from '@renderer/screens'
import { Button } from '@renderer/components/buttons'
import { useDebouncedLoginValidation } from '../hooks/useDebouncedLoginValidation'

export const RegisterForm: FC = () => {
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')

  const {
    isLoading: isRegisterLoading,
    trigger: registerTrigger,
    isError: isRegisterError,
    error: registerError
  } = useRegister()

  const { isLoading: isLoginLoading, trigger: loginTrigger } = useLogin()
  const { login } = useAuthActions()

  const { error: loginError, isValidating: isLoginValidating } = useDebouncedLoginValidation(
    nickname,
    400
  )

  const isLoading = isRegisterLoading || isLoginLoading

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (loginError || !nickname || !password) return

    try {
      const result = await registerTrigger({ username: nickname, password })
      if (!result) throw new Error('Registration failed')

      const loginResult = await loginTrigger({ username: nickname, password })
      if (!loginResult) throw new Error('Login after registration failed')

      login(nickname, loginResult.accessToken)
      setScreenMode(AuthScreenMode.login)
    } catch (error) {
      console.error('Register error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Регистрация аккаунта</h2>
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
        {loginError && <p className={styles.error}>{loginError}</p>}
        {isRegisterError && <p className={styles.error}>{registerError || 'Ошибка регистрации'}</p>}
      </div>

      <div className={styles.buttons}>
        <Button
          style={{flex: 1}}
          variant="primary"
          loading={isLoading}
          type="submit"
          disabled={!!loginError || isLoginValidating || !nickname || !password}
        >
          Регистрация
        </Button>
        <Button variant="default" onClick={() => setScreenMode(AuthScreenMode.login)}>
          Отмена
        </Button>
      </div>
    </form>
  )
}
