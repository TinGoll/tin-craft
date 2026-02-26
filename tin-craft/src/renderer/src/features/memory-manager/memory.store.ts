import { createStore, useStore } from 'zustand'

type MemoryState = {
  memory: string
  loading: boolean
  setMemory: (value: string) => void
  init: () => void
}

export const memoryStore = createStore<MemoryState>()((set) => ({
  memory: '4G',
  loading: false,
  setMemory: (value: string) => {
    set({ memory: value })
    window.api.store.set('maxMemory', value).catch((e) => {
      console.error('Failed to save memory setting', e)
    })
  },
  init: () => {
    set({ loading: true })
    window.api.store
      .get<string>('maxMemory')
      .then((value) => {
        set({ memory: value ?? '4G', loading: false })
      })
      .catch((e) => {
        console.error('Memory init failed', e)
        set({ memory: '4G', loading: false })
      })
  }
}))

export const useMemory = (): string => useStore(memoryStore, (state) => state.memory)
export const useMemoryLoading = (): boolean => useStore(memoryStore, (state) => state.loading)
export const { setMemory, init: initMemory } = memoryStore.getState()
