import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  checkJava: (): Promise<string | null> => ipcRenderer.invoke('check-java'),
  installJava: (): Promise<string> => ipcRenderer.invoke('install-java'),

  // Функция подписки на прогресс
  onJavaProgress: (callback: (data: { status: string; percent: number }) => void) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription = (_event: any, data: any): void => callback(data)
    ipcRenderer.on('java-progress', subscription)

    // Возвращаем функцию отписки (cleanup)
    return () => {
      ipcRenderer.removeListener('java-progress', subscription)
    }
  },
  launchGame: (
    javaPath: string,
    username: string,
    uuid: string,
    accessToken: string
  ): Promise<void> => ipcRenderer.invoke('launch-game', javaPath, username, uuid, accessToken),
  updateGame: () => ipcRenderer.invoke('update-game'),
  onUpdateProgress: (callback: (data: { status: string; percent: number }) => void) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sub = (_: any, data: any): void => callback(data)
    ipcRenderer.on('update-progress', sub)
    return () => ipcRenderer.removeListener('update-progress', sub)
  },
  login: (login: string, pass: string) => ipcRenderer.invoke('auth-login', login, pass),
  validateSession: () => ipcRenderer.invoke('auth-validate'),
  logout: () => ipcRenderer.invoke('auth-logout')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
