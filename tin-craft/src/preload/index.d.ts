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
  getSettings: () => Promise<void>
  saveSetting: (key: string, value: any) => Promise<void>

  checkJava: () => Promise<string | null>
  installJava: () => Promise<string>
  onJavaProgress: (callback: (data: { status: string; percent: number }) => void) => () => void
  updateGame: () => void
  onUpdateProgress: (callback: (data: { status: string; percent: number }) => void) => () => void
  launchGame: (javaPath: string, username: string) => Promise<void>
  onLaunchProgress: (callback: any) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: LauncherAPI
  }
}
