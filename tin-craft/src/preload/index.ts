/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  isFocused: () => ipcRenderer.invoke('window-is-focused'),
  focus: () => ipcRenderer.send('window-focus'),
  hide: () => ipcRenderer.send('window-hide'),
  show: () => ipcRenderer.send('window-show'),
  move: (x, y) => ipcRenderer.send('window-move', x, y),
  resize: (width, height) => ipcRenderer.send('window-resize', width, height),

  // Настройки
  hardReset: () => ipcRenderer.invoke('hard-reset'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSetting: (key: string, value: any) => ipcRenderer.invoke('save-setting', key, value),
  fetch: <T = any>(url: string, options?: RequestInit) =>
    ipcRenderer.invoke('api:request', { url, options }) as Promise<{
      success: boolean
      data: T | null
      error: string | null
    }>,
  checkServerAvailability: (url: string): Promise<boolean> =>
    ipcRenderer.invoke('check-server-availability', url),

  store: {
    get: <T = any>(key: string): Promise<T> => ipcRenderer.invoke('store:get', key),

    set: (key: string, value: any): Promise<void> => ipcRenderer.invoke('store:set', key, value),

    delete: (key: string): Promise<void> => ipcRenderer.invoke('store:delete', key)
  },

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
  launchGame: (javaPath: string, username: string, offline = false) =>
    ipcRenderer.invoke('launch-game', javaPath, username, offline),
  onLaunchProgress: (callback: any) => {
    const sub = (_: any, data: any) => callback(data)
    ipcRenderer.on('launch-progress', sub)
    return () => ipcRenderer.removeListener('launch-progress', sub)
  },
  onGameClosed: (callback: (data: { code: number }) => void) => {
    const sub = (_: any, data: any) => callback(data)
    ipcRenderer.on('game-closed', sub)
    return () => ipcRenderer.removeListener('game-closed', sub)
  },
  onMainLog: (callback: (msg: string) => void) => {
    const listener = (_: unknown, msg: string) => callback(msg)
    ipcRenderer.on('main-log', listener)
    return () => {
      ipcRenderer.removeListener('main-log', listener)
    }
  }
}

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
