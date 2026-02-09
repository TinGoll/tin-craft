/* eslint-disable @typescript-eslint/no-explicit-any */
import { app, shell, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import javaManager from './javaManager'
import gameManager from './gameManager'
import updateManager from './UpdateManager'
import store from './store'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.handle('api:request', async (_, { url, options }) => {
    try {
      const response = await fetch(url, options)
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        return { success: false, data: null, error: data?.message || `HTTP ${response.status}` }
      }
      return { success: true, data, error: null }
    } catch (err: any) {
      return { success: false, data: null, error: err.message || 'Unknown error' }
    }
  })

  ipcMain.handle('get-settings', () => store.store)
  ipcMain.handle('save-setting', (_, key, value) => store.set(key, value))

  ipcMain.handle('check-java', async () => {
    return await javaManager.checkJava()
  })

  ipcMain.handle('store:get', (_, key) => store.get(key))
  ipcMain.handle('store:set', (_, key, value) => store.set(key, value))
  ipcMain.handle('store:delete', (_, key) => store.delete(key))

  ipcMain.handle('install-java', async (event) => {
    try {
      const javaPath = await javaManager.downloadAndInstall((status, percent) => {
        event.sender.send('java-progress', { status, percent })
      })
      return javaPath
    } catch (error) {
      console.error('Java installation error:', error)
      throw error
    }
  })

  ipcMain.handle('update-game', async (event) => {
    try {
      await updateManager.checkForUpdates((status, percent) => {
        event.sender.send('update-progress', { status, percent })
      })
      return true
    } catch (e) {
      console.error(e)
      throw e
    }
  })

  ipcMain.handle(
    'launch-game',
    async (event: IpcMainInvokeEvent, javaPath: string, username: string) => {
      const user = {
        username: username,
        uuid: '00000000-0000-0000-0000-000000000000',
        accessToken: 'dummy_token'
      }
      const win = BrowserWindow.fromWebContents(event.sender)

      await gameManager.launchGame(
        javaPath,
        user,
        (status, percent) => {
          win?.webContents.send('launch-progress', { status, percent })
        },
        (code) => {
          if (win && !win.isDestroyed()) {
            win.webContents.send('game-closed', { code })
          }
        }
      )
    }
  )

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
