import { createStore, useStore } from 'zustand'

type State = {
  status: string
  hintText: string
  progress: number
  isBusy: boolean
  isPlaying: boolean

  setStatus: (value: string) => void
  setProgress: (value: number) => void
  setIsBusy: (value: boolean) => void
  setIsPlaying: (value: boolean) => void
  setHintText: (value: string) => void
}

export const palyScreenStore = createStore<State>()((set) => ({
  status: 'Жми "Играть" - и в бой!',
  hintText: '',
  progress: 0,
  isBusy: false,
  isPlaying: false,
  setStatus: (value: string) => set({ status: value }),
  setProgress: (value: number) => set({ progress: value }),
  setIsBusy: (value: boolean) => set({ isBusy: value }),
  setIsPlaying: (value: boolean) => set({ isPlaying: value }),
  setHintText: (value: string) => set({ hintText: value })
}))

export const useStatus = (): string => useStore(palyScreenStore, (state) => state.status)
export const useProgress = (): number => useStore(palyScreenStore, (state) => state.progress)
export const useHintText = (): string => useStore(palyScreenStore, (state) => state.hintText)
export const useIsBusy = (): boolean => useStore(palyScreenStore, (state) => state.isBusy)
export const useIsPlaying = (): boolean => useStore(palyScreenStore, (state) => state.isPlaying)

export const { setStatus, setProgress, setIsBusy, setIsPlaying, setHintText } =
  palyScreenStore.getState()
