import { createStore, useStore } from 'zustand'

export enum AuthScreenMode {
  login = 'login',
  register = 'register'
}

type State = {
  mode: AuthScreenMode
  setMode: (mode: AuthScreenMode) => void
}

export const authScreenStore = createStore<State>()((set) => ({
  mode: AuthScreenMode.login,
  setMode: (mode: AuthScreenMode) => set({ mode })
}))

export const useAuthScreenMode = (): AuthScreenMode =>
  useStore(authScreenStore, (state) => state.mode)
export const { setMode: setScreenMode } = authScreenStore.getState()
