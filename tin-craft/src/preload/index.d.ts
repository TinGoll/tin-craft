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
  checkJava: () => Promise<string | null>
  installJava: () => Promise<string>
  onJavaProgress: (callback: (data: { status: string; percent: number }) => void) => () => void
  launchGame: (
    javaPath: string,
    username: string,
    uuid: string,
    accessToken: string
  ) => Promise<void>
  updateGame: () => void
  onUpdateProgress: (callback: (data: { status: string; percent: number }) => void) => () => void
  login: (login: string, pass: string) => Promise<AuthResponse>
  validateSession: () => Promise<AuthResponse | null>
  logout: () => Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: LauncherAPI
  }
}
