/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, ILauncherOptions } from 'minecraft-launcher-core'
import { app } from 'electron'
import path from 'path'
import fs from 'fs-extra'
import store from './store'
import serverListManager from './serverListManager'
import AdmZip from 'adm-zip'
import { logToRenderer } from '.'

interface UserData {
  username: string
  uuid: string
  accessToken: string
}

type ProgressCallback = (status: string, percent: number) => void
type ClosedCallback = (code: number) => void

class GameManager {
  private launcher: Client

  constructor() {
    this.launcher = new Client()
  }

  private getResourcePath(filename: string): string {
    if (app.isPackaged) {
      return path.join(process.resourcesPath, 'resources', filename)
    }
    return path.join(process.cwd(), 'resources', filename)
  }

  private getForgeInstallerPath(): string {
    return path.join(app.getPath('userData'), 'minecraft_data', 'forge-installer.jar')
  }

  async launchGame(
    javaPath: string,
    userData: UserData,
    onProgress: ProgressCallback,
    onGameClosed: ClosedCallback,
    offline = false
  ): Promise<void> {
    const rootPath = path.join(app.getPath('userData'), 'minecraft_data')
    const forgeInstaller = this.getForgeInstallerPath()

    this.launcher.removeAllListeners('progress')
    this.launcher.removeAllListeners('download')
    this.launcher.removeAllListeners('debug')
    this.launcher.removeAllListeners('data')
    this.launcher.removeAllListeners('close')

    if (!offline) {
      await serverListManager.addServerToList(rootPath, {
        name: 'TinCraft Server',
        ip: 'tincraft.minerent.io'
      })
    }

    await this.ensureLibraries(rootPath, onProgress)

    if (!fs.existsSync(forgeInstaller)) {
      throw new Error('Forge Installer не найден! Проверьте обновление.')
    }

    const memoryMax = store.get('maxMemory', '4G')
    const memoryMin = store.get('minMemory', '2G')
    const fullScreen = store.get('settings.fullScreen', false)

    logToRenderer('fullScreen', fullScreen)
    console.log('fullScreen', fullScreen)

    const opts: ILauncherOptions = {
      authorization: {
        access_token: userData.accessToken,
        client_token: userData.uuid,
        uuid: userData.uuid,
        name: userData.username,
        user_properties: {},
        meta: { type: 'mojang', demo: false }
      },
      root: rootPath,
      javaPath: javaPath,
      version: { number: '1.21.1', type: 'release' },
      forge: forgeInstaller,
      memory: { max: memoryMax, min: memoryMin },
      ...(offline
        ? {}
        : {
            quickPlay: {
              type: 'multiplayer' as const,
              identifier: 'tincraft.minerent.io'
            }
          }),
      window: {
        fullscreen: fullScreen
      }
    }

    console.log('options', opts)

    console.log(`Launch Minecraft 1.21.1 (NeoForge) from Java: ${javaPath}`)

    this.launcher.on('progress', (e: any) => {
      if (e.total > 0) {
        const percent = Math.round((e.task / e.total) * 100)
        let typeName = e.type
        if (e.type === 'assets') typeName = 'Ассеты'
        if (e.type === 'natives') typeName = 'Библиотеки'
        if (e.type === 'classes') typeName = 'Файлы игры'

        onProgress(`Загрузка ${typeName}: ${e.task}/${e.total}`, percent)
      }
    })

    this.launcher.on('download', (_e: string) => {
      // e - это имя файла.
      // onProgress(`Скачивание: ${e}`, -1);
    })

    // 3. Отладка и установка Forge
    this.launcher.on('debug', (e: string) => {
      const log = e.toString()
      // Фильтруем важные сообщения от Forge Installer
      if (log.includes('Building') || log.includes('Mapper') || log.includes('Processor')) {
        onProgress(`Настройка Forge: ${log.substring(0, 40)}...`, 100)
      }
    })

    // 4. Запуск процесса игры
    this.launcher.on('data', (d) => {
      const data = d.toString()
      if (data.includes('ModLauncher running')) {
        console.log('Minecraft launched!')
        onProgress('Клиент запущен!', 100)
      }
    })

    const subprocess = await this.launcher.launch(opts)

    subprocess?.on('close', (code) => {
      console.log(`Minecraft closed with a code: ${code}`)
      onGameClosed(code || 0)
    })
  }
  async hardResetGame(onProgress: ProgressCallback): Promise<void> {
    const rootPath = path.join(app.getPath('userData'), 'minecraft_data')

    const foldersToDelete = ['libraries', 'assets', 'versions', 'mods', 'config', 'webcache2']

    if (!fs.existsSync(rootPath)) {
      return
    }

    onProgress('Очистка системных файлов...', 0)

    for (const folder of foldersToDelete) {
      const target = path.join(rootPath, folder)
      if (await fs.pathExists(target)) {
        console.log(`Deleting: ${target}`)
        await fs.remove(target)
      }
    }

    onProgress('Очистка завершена. Готов к переустановке.', 100)
  }

  private async ensureLibraries(rootPath: string, onProgress: ProgressCallback): Promise<void> {
    const libFolder = path.join(rootPath, 'libraries')
    const zipPath = this.getResourcePath('libraries.zip')

    logToRenderer('[LOG]', 'Проверка библиотек...')
    logToRenderer('[LOG]', 'libFolder: ' + libFolder)
    logToRenderer('[LOG]', 'zipPath: ' + zipPath)

    if (await fs.pathExists(libFolder)) {
      return
    }

    if (!fs.existsSync(zipPath)) {
      console.warn('libraries.zip не найден в ресурсах, будет выполнена полная загрузка из сети.')
      logToRenderer(
        '[WARN]',
        'libraries.zip не найден в ресурсах, будет выполнена полная загрузка из сети.'
      )
      return
    }

    onProgress('Распаковка библиотек...', 0)
    try {
      const zip = new AdmZip(zipPath)
      zip.extractAllTo(rootPath, true)

      onProgress('Библиотеки успешно распакованы!', 100)
    } catch (e) {
      console.error('Ошибка распаковки libraries.zip:', e)
      logToRenderer(
        '[WARN]',
        'libraries.zip не найден в ресурсах, будет выполнена полная загрузка из сети.',
        e
      )
    }
  }
}

export default new GameManager()
