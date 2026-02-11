import { FC, ReactNode } from 'react'
import { AuthScreenMode, useAuthScreenMode } from './store'
import styles from './AuthScreen.module.css'
import { LoginForm, RegisterForm } from '@renderer/features/auth'

export const AuthScreen: FC = () => {
  const registry: Record<AuthScreenMode, () => ReactNode> = {
    [AuthScreenMode.login]: () => <LoginForm />,
    [AuthScreenMode.register]: () => <RegisterForm />
  }

  return <div className={styles.screen}>{registry[useAuthScreenMode()]?.()}</div>
}
