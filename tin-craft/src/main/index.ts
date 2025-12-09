import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
// import { v4 as uuidv4 } from 'uuid'

import javaManager from './javaManager'
import gameManager from './gameManager'
import updateManager from './UpdateManager'
import authManager from './AuthManager'

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

  ipcMain.handle('check-java', async () => {
    return await javaManager.checkJava()
  })

  ipcMain.handle('install-java', async (event) => {
    try {
      const javaPath = await javaManager.downloadAndInstall((status, percent) => {
        // Отправляем сообщение в renderer процесс
        // Используем уникальный канал для прогресса
        event.sender.send('java-progress', { status, percent })
      })
      return javaPath
    } catch (error) {
      console.error('Java installation error:', error)
      throw error // Ошибка улетит в renderer
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
    async (_, javaPath: string, username: string, uuid: string, accessToken: string) => {
      // В реальном проекте UUID и Token должны приходить от твоего бэкенда авторизации
      // Пока генерируем "фейковые" для теста
      const dummyUserData = {
        username: username,
        uuid: uuid,
        accessToken: accessToken
      }

      try {
        await gameManager.launchGame(javaPath, dummyUserData)
        return 'Запуск инициирован'
      } catch (error) {
        console.error(error)
        throw new Error('Could not start the game')
      }
    }
  )

  // Вход по логину/паролю
  ipcMain.handle('auth-login', async (_, login, pass) => {
    return await authManager.login(login, pass)
  })

  // Проверка сессии при запуске
  ipcMain.handle('auth-validate', async () => {
    return await authManager.validate()
  })

  // Выход
  ipcMain.handle('auth-logout', async () => {
    authManager.logout()
    return true
  })

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
