import { createStore, useStore } from 'zustand'

type SettingsState = {
  memory: string
  loading: boolean
  showScreen: boolean
  fullScreen: boolean
  setFullScreen: (value: boolean) => void
  init: () => void
  setMemory: (value: string) => void
  setShowScreen: (value: boolean) => void
  toggleShowScreen: () => void
}

export const settingsStore = createStore<SettingsState>()((set) => ({
  showScreen: false,
  loading: false,
  memory: '4G',
  fullScreen: false,
  init: async () => {
    set({ loading: true })
    try {
      const [memory, fullScreen] = await Promise.all([
        window.api.store.get<string>('maxMemory'),
        window.api.store.get<boolean>('settings.fullScreen')
      ])

      set({
        memory: memory ?? '4G',
        fullScreen: fullScreen ?? false,
        loading: false
      })
    } catch (e) {
      console.error('Settings init failed', e)

      set({
        memory: '4G',
        fullScreen: false,
        loading: false
      })
    }
  },
  setMemory: (value: string) => {
    set({ memory: value })
    window.api.store.set('maxMemory', value).catch((e) => {
      console.error('Failed to save memory setting', e)
    })
  },
  setFullScreen: (value: boolean) => {
    set({ fullScreen: value })
    window.api.store.set('settings.fullScreen', value).catch((e) => {
      console.error('Failed to save fullScreen setting', e)
    })
  },
  setShowScreen: (value: boolean) => set({ showScreen: value }),
  toggleShowScreen: () => set((state) => ({ showScreen: !state.showScreen }))
}))

export const useMemory = (): string => useStore(settingsStore, (state) => state.memory)
export const useFullScreen = (): boolean => useStore(settingsStore, (state) => state.fullScreen)
export const useSettingsLoading = (): boolean => useStore(settingsStore, (state) => state.loading)

export const useShowSettingsScreen = (): boolean =>
  useStore(settingsStore, (state) => state.showScreen)
export const {
  setShowScreen: setShowSettingsScreen,
  toggleShowScreen: toggleSettingsScreen,
  init: initSettings,
  setFullScreen,
  setMemory
} = settingsStore.getState()
