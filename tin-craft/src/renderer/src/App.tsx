import { FC, useEffect } from 'react'
import { Layout } from './components'
import { useAuthActions, useAuthLoading, useAuthUser } from './features/auth'
import { AuthScreen, PlayScreen, SettingsScreen } from './screens'
import { initSettings, useSettingsLoading, useShowSettingsScreen } from './features/settings'

export const App: FC = () => {
  const { init } = useAuthActions()
  const loadingAuth = useAuthLoading()
  const loadingSettings = useSettingsLoading()

  const user = useAuthUser()
  const settingsScreen = useShowSettingsScreen()
  const loading = loadingAuth || loadingSettings

  useEffect(() => {
    init()
    initSettings()
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
