import { Client, ILauncherOptions } from 'minecraft-launcher-core'
import { app } from 'electron'
import path from 'path'
// import modManager from './ModManager'
import fs from 'fs-extra'
import serverListManager from './serverListManager'
import authManager from './AuthManager'
import store from './store'

// Интерфейс для данных пользователя (приходит с фронтенда)
interface UserData {
  username: string
  uuid: string
  accessToken: string
}

class GameManager {
  private launcher: Client

  constructor() {
    this.launcher = new Client()
  }

  private getForgeInstallerPath(): string {
    const fileName = 'forge-installer.jar'
    return path.join(app.getPath('userData'), 'minecraft_data', fileName)
  }

  private getAuthlibInjectorPath(): string {
    return path.join(app.getPath('userData'), 'minecraft_data', 'authlib-injector.jar')
  }

  // Основная функция запуска
  async launchGame(javaPath: string, userData: UserData): Promise<void> {
    const rootPath = path.join(app.getPath('userData'), 'minecraft_data')

    const authInjector = this.getAuthlibInjectorPath()
    const authUrl = authManager.getAuthServerURL()

    // ПРОВЕРКА: Если инжектора нет, мы не сможем зайти на сервер
    if (!fs.existsSync(authInjector)) {
      throw new Error('Authlib Injector not found! Try restarting the launcher to update.')
    }

    // --- ДОБАВЛЯЕМ ЭТОТ БЛОК ---
    await serverListManager.addServerToList(rootPath, {
      name: 'Tin Craft', // Название, которое увидит игрок
      ip: 'localhost:25565' // Твой IP
    })

    const forgeInstaller = this.getForgeInstallerPath()

    // 1. Синхронизируем моды
    // console.log('Syncing mods...')
    // await modManager.syncMods(rootPath)

    // Проверяем, существует ли инсталлятор
    if (!fs.existsSync(forgeInstaller)) {
      throw new Error(`Forge Installer not found along the way: ${forgeInstaller}`)
    }

    // Опции запуска для 1.21.1
    const opts: ILauncherOptions = {
      authorization: {
        access_token: userData.accessToken,
        client_token: store.get('clientToken') as string, // Важно передать тот же clientToken
        uuid: userData.uuid,
        name: userData.username,
        user_properties: {}, // Для скинов иногда нужно получать свойства, но инжектор это делает сам
        meta: {
          type: 'mojang', // MCLC думает что это Mojang
          demo: false
        }
      },
      root: rootPath,
      javaPath: javaPath,

      version: {
        number: '1.21.1',
        type: 'release'
      },

      // --- НАСТРОЙКИ FORGE ---
      forge: forgeInstaller, // <-- Указываем путь к jar инсталлятора

      memory: {
        max: '6G', // Для модов лучше выделить больше памяти (4-6Gb)
        min: '2G'
      },
      customArgs: [
        // Формат: -javaagent:путь=URL
        `-javaagent:${authInjector}=${authUrl}`
        // Для Java 21+ иногда нужны флаги, открывающие модули,
        // но MCLC и Forge обычно сами их добавляют.
        // Если будут ошибки "Unable to instrument", нужно добавить флаг:
        // "-Dorg.gradlex.jvm.toolchain.launcher.WelcomeMessage=false"
      ]
    }

    console.log(`Running Minecraft 1.21.1 (Forge) on Java: ${javaPath}`)

    // Подписки на события лаунчера
    // this.launcher.on('debug', (e) => console.log(`[DEBUG] ${e}`))
    // this.launcher.on('data', (e) => console.log(`[DATA] ${e}`))

    // Прогресс загрузки (библиотеки, ассеты)
    this.launcher.on('progress', () => {
      // Мы можем отправлять это в Renderer, если нужно
      // console.log(`Loading: ${e.type} - ${e.task} / ${e.total}`)
    })

    // Запуск
    try {
      const subprocess = await this.launcher.launch(opts)

      subprocess?.on('close', (code) => {
        console.log(`Minecraft closed with a code: ${code}`)
      })
    } catch (error) {
      console.error('Error when starting the game:', error)
      throw error
    }
  }
}

export default new GameManager()
