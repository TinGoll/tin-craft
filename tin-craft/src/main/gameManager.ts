/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, ILauncherOptions } from 'minecraft-launcher-core'
import { app } from 'electron'
import path from 'path'
import fs from 'fs-extra'
import store from './store'
import serverListManager from './serverListManager'

interface UserData {
  username: string
  uuid: string
  accessToken: string
}

type ProgressCallback = (status: string, percent: number) => void

class GameManager {
  private launcher: Client

  constructor() {
    this.launcher = new Client()
  }

  private getForgeInstallerPath(): string {
    return path.join(app.getPath('userData'), 'minecraft_data', 'forge-installer.jar')
  }

  async launchGame(
    javaPath: string,
    userData: UserData,
    onProgress: ProgressCallback
  ): Promise<void> {
    const rootPath = path.join(app.getPath('userData'), 'minecraft_data')
    const forgeInstaller = this.getForgeInstallerPath()

    // 0. Очистка старых слушателей (Важно!)
    this.launcher.removeAllListeners('progress')
    this.launcher.removeAllListeners('download')
    this.launcher.removeAllListeners('debug')
    this.launcher.removeAllListeners('data')
    this.launcher.removeAllListeners('close')

    await serverListManager.addServerToList(rootPath, {
      name: 'My Server Project',
      ip: '127.0.0.1:25565'
    })

    if (!fs.existsSync(forgeInstaller)) {
      throw new Error('Forge Installer не найден! Проверьте обновление.')
    }

    const memoryMax = store.get('maxMemory', '4G')
    const memoryMin = store.get('minMemory', '2G')

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
      quickPlay: {
        type: 'multiplayer',
        identifier: 'localhost:25565'
      }
    }

    console.log(`Launch Minecraft 1.21.1 (NeoForge) from Java: ${javaPath}`)

    // 1. Прогресс загрузки файлов (assets, libraries)
    this.launcher.on('progress', (e: any) => {
      // e: { type: 'assets', task: 120, total: 1050 }
      if (e.total > 0) {
        const percent = Math.round((e.task / e.total) * 100)
        // Переводим типы на русский для красоты
        let typeName = e.type
        if (e.type === 'assets') typeName = 'Ассеты'
        if (e.type === 'natives') typeName = 'Библиотеки'
        if (e.type === 'classes') typeName = 'Файлы игры'

        onProgress(`Загрузка ${typeName}: ${e.task}/${e.total}`, percent)
      }
    })

    this.launcher.on('download', (_e: string) => {
      // e - это имя файла. Можно обновлять статус, но без процента, чтобы не дергалось.
      // onProgress(`Скачивание: ${e}`, -1); // -1 чтобы не менять percent
    })

    // 3. Отладка и установка Forge
    // Forge пишет свои логи в событие 'debug' или 'data' во время установки
    this.launcher.on('debug', (e: string) => {
      const log = e.toString()
      // Фильтруем важные сообщения от Forge Installer
      if (log.includes('Building') || log.includes('Mapper') || log.includes('Processor')) {
        onProgress(`Настройка Forge: ${log.substring(0, 40)}...`, 100)
      }
    })

    // 4. Запуск процесса игры
    this.launcher.on('data', (e: any) => {
      // Когда игра начала писать логи - значит окно почти открылось
      onProgress('Клиент запускается...', 100)
    })

    const subprocess = await this.launcher.launch(opts)
    subprocess?.on('close', (code) => console.log(`Game closed: ${code}`))
  }
}

export default new GameManager()
