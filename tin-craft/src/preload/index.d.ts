/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElectronAPI } from '@electron-toolkit/preload'

// Тип данных профиля
interface AuthProfile {
  id: string
  name: string
}

interface AuthResponse {
  accessToken: string
  clientToken: string
  selectedProfile: AuthProfile
}

interface LauncherAPI {
  minimize: () => void
  maximize: () => void
  close: () => void
  isMaximized: () => Promise<boolean>
  isFocused: () => void
  focus: () => void
  hide: () => void
  show: () => void
  move: (x: number, y: number) => void
  resize: (width: number, height: number) => void

  getSettings: () => Promise<void>
  saveSetting: (key: string, value: any) => Promise<void>

  checkJava: () => Promise<string | null>
  installJava: () => Promise<string>
  onJavaProgress: (callback: (data: { status: string; percent: number }) => void) => () => void
  updateGame: () => void
  onUpdateProgress: (callback: (data: { status: string; percent: number }) => void) => () => void
  launchGame: (javaPath: string, username: string) => Promise<void>
  onLaunchProgress: (callback: any) => () => void
  onGameClosed: (callback: (data: { code: number }) => void) => () => void

  fetch: <T = any>(
    url: string,
    options?: RequestInit
  ) => Promise<{
    success: boolean
    data: T | null
    error: string | null
  }>

  store: {
    get<T = any>(key: string): Promise<T>
    set(key: string, value: any): Promise<void>
    delete(key: string): Promise<void>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: LauncherAPI
  }
}
