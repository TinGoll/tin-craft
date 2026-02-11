import { FC, useEffect } from 'react'
import { Layout } from './components'
import { useAuthActions, useAuthLoading, useAuthUser } from './features/auth'
import { AuthScreen, PlayScreen } from './screens'

export const App: FC = () => {
  const { init } = useAuthActions()
  const loading = useAuthLoading()
  const user = useAuthUser()

  useEffect(() => {
    init()
  }, [init])

  if (loading) {
    return <div>Loading...</div>
  }

  if (user) {
    return (
      <Layout>
        <PlayScreen />
      </Layout>
    )
  }

  return (
    <Layout>
      <AuthScreen />
    </Layout>
  )
}
