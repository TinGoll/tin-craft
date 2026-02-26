/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useStore } from 'zustand'
import { authStore } from './store'

export const useIsAuth = (): boolean => useStore(authStore, (s) => Boolean(s.user && s.accessToken))
export const useAuthLoading = (): boolean => useStore(authStore, (s) => s.loading)
export const useAuthUser = (): string | null => useStore(authStore, (s) => s.user)
export const useAuthToken = (): string | null => useStore(authStore, (s) => s.accessToken)
export const useHasFirstLaunch = (): boolean => useStore(authStore, (s) => s.hasFirstLaunch)
export const useLastSuccessLoginUsers = (): Record<string, string> =>
  useStore(authStore, (s) => s.lastSuccessLoginUsers)

export const useAuthActions = () => {
  const init = useStore(authStore, (s) => s.init)
  const login = useStore(authStore, (s) => s.login)
  const logout = useStore(authStore, (s) => s.logout)
  const setHasFirstLaunch = useStore(authStore, (s) => s.setHasFirstLaunch)
  const addSuccessLoginUser = useStore(authStore, (s) => s.addSuccessLoginUser)
  const removeSuccessLoginUser = useStore(authStore, (s) => s.removeSuccessLoginUser)

  return { init, login, logout, setHasFirstLaunch, addSuccessLoginUser, removeSuccessLoginUser }
}
