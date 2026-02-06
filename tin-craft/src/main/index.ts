import { app, shell, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
// import { v4 as uuidv4 } from 'uuid'

import javaManager from './javaManager'
import gameManager from './gameManager'
import updateManager from './UpdateManager'
import store from './store'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // 1. Настройки
  ipcMain.handle('get-settings', () => store.store)
  ipcMain.handle('save-setting', (_, key, value) => store.set(key, value))

  ipcMain.handle('check-java', async () => {
    return await javaManager.checkJava()
  })

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
        // 1. Прогресс
        (status, percent) => {
          win?.webContents.send('launch-progress', { status, percent })
        },
        // 2. Игра закрылась (НОВОЕ)
        (code) => {
          // Отправляем событие 'game-closed' в React
          // Проверка win?.isDestroyed() нужна, если пользователь закрыл лаунчер во время игры
          if (win && !win.isDestroyed()) {
            win.webContents.send('game-closed', { code })
          }
        }
      )
    }
  )

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
