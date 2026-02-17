import { createStore, useStore } from 'zustand'

type State = {
  status: string
  hintText: string
  progress: number
  isBusy: boolean
  isPlaying: boolean
  isProgressVisible: boolean

  setStatus: (value: string) => void
  setProgress: (value: number) => void
  setIsBusy: (value: boolean) => void
  setIsPlaying: (value: boolean) => void
  setHintText: (value: string) => void
  setIsProgressVisible: (value: boolean) => void
}

export const palyScreenStore = createStore<State>()((set) => ({
  status: '',
  hintText: 'Жми «Играть» - и в бой! Хочешь сменить пользователя - жми «Выход».',
  progress: 0,
  isBusy: false,
  isPlaying: false,
  isProgressVisible: false,
  setStatus: (value: string) => set({ status: value }),
  setProgress: (value: number) => set({ progress: value }),
  setIsBusy: (value: boolean) => set({ isBusy: value }),
  setIsPlaying: (value: boolean) => set({ isPlaying: value }),
  setHintText: (value: string) => set({ hintText: value }),
  setIsProgressVisible: (value: boolean) => set({ isProgressVisible: value })
}))

export const useStatus = (): string => useStore(palyScreenStore, (state) => state.status)
export const useProgress = (): number => useStore(palyScreenStore, (state) => state.progress)
export const useHintText = (): string => useStore(palyScreenStore, (state) => state.hintText)
export const useIsBusy = (): boolean => useStore(palyScreenStore, (state) => state.isBusy)
export const useIsPlaying = (): boolean => useStore(palyScreenStore, (state) => state.isPlaying)
export const useIsProgressVisible = (): boolean =>
  useStore(palyScreenStore, (state) => state.isProgressVisible)

export const {
  setStatus,
  setProgress,
  setIsBusy,
  setIsPlaying,
  setHintText,
  setIsProgressVisible
} = palyScreenStore.getState()
