/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Настройки
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSetting: (key: string, value: any) => ipcRenderer.invoke('save-setting', key, value),

  checkJava: (): Promise<string | null> => ipcRenderer.invoke('check-java'),
  installJava: (): Promise<string> => ipcRenderer.invoke('install-java'),

  onJavaProgress: (callback: (data: { status: string; percent: number }) => void) => {
    const subscription = (_event: any, data: any): void => callback(data)
    ipcRenderer.on('java-progress', subscription)

    return () => {
      ipcRenderer.removeListener('java-progress', subscription)
    }
  },
  updateGame: () => ipcRenderer.invoke('update-game'),
  onUpdateProgress: (callback: any) => {
    const sub = (_: any, data: any) => callback(data)
    ipcRenderer.on('update-progress', sub)
    return () => ipcRenderer.removeListener('update-progress', sub)
  },
  launchGame: (javaPath: string, username: string) =>
    ipcRenderer.invoke('launch-game', javaPath, username),
  onLaunchProgress: (callback: any) => {
    const sub = (_: any, data: any) => callback(data)
    ipcRenderer.on('launch-progress', sub)
    return () => ipcRenderer.removeListener('launch-progress', sub)
  }
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
