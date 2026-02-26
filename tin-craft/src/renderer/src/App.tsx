import { FC, useEffect } from 'react'
import { Layout } from './components'
import { useAuthActions, useAuthLoading, useAuthUser } from './features/auth'
import { AuthScreen, PlayScreen, SettingsScreen } from './screens'
import { useShowSettingsScreen } from './features/settings'
import { initMemory, useMemoryLoading } from './features/memory-manager'

export const App: FC = () => {
  const { init } = useAuthActions()
  const loadingAuth = useAuthLoading()
  const loadingMemory = useMemoryLoading()

  const user = useAuthUser()
  const settingsScreen = useShowSettingsScreen()
  const loading = loadingAuth || loadingMemory

  useEffect(() => {
    init()
    initMemory()
  }, [init])

  if (loading) {
    return <div>Loading...</div>
  }

  if (settingsScreen) {
    return (
      <Layout>
        <SettingsScreen />
      </Layout>
    )
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
