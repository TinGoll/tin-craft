import { createStore, useStore } from 'zustand'

type SettingsState = {
  showScreen: boolean
  setShowScreen: (value: boolean) => void
  toggleShowScreen: () => void
}

export const settingsStore = createStore<SettingsState>()((set) => ({
  showScreen: false,
  setShowScreen: (value: boolean) => set({ showScreen: value }),
  toggleShowScreen: () => set((state) => ({ showScreen: !state.showScreen }))
}))

export const useShowSettingsScreen = (): boolean =>
  useStore(settingsStore, (state) => state.showScreen)
export const { setShowScreen: setShowSettingsScreen, toggleShowScreen: toggleSettingsScreen } =
  settingsStore.getState()
