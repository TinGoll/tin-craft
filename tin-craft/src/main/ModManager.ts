import fs from 'fs-extra'
import path from 'path'
import { app } from 'electron'

class ModManager {
  // Путь, где лежат моды внутри твоего Electron приложения (исходники)
  // В продакшене (после сборки) путь может отличаться, используем process.resourcesPath
  private sourceModsDir: string

  constructor() {
    // Если мы в dev режиме - берем из корня проекта/resources/mods
    // Если в build - из ресурсов приложения
    if (app.isPackaged) {
      this.sourceModsDir = path.join(process.resourcesPath, 'resources', 'mods')
    } else {
      this.sourceModsDir = path.join(process.cwd(), 'resources', 'mods')
    }
  }

  async syncMods(gameRoot: string): Promise<void> {
    const targetModsDir = path.join(gameRoot, 'mods')

    try {
      // 1. Создаем папку mods в игре, если нет
      await fs.ensureDir(targetModsDir)

      // 2. (Опционально) Очищаем старые моды перед копированием новых
      // Это полезно, чтобы у игроков не оставались старые версии модов
      await fs.emptyDir(targetModsDir)

      // 3. Копируем моды из ресурсов лаунчера в папку игры
      if (await fs.pathExists(this.sourceModsDir)) {
        console.log(`Copying mods from ${this.sourceModsDir} to ${targetModsDir}`)
        await fs.copy(this.sourceModsDir, targetModsDir)
      } else {
        console.warn('The mods folder was not found in the resources, skipping.')
      }
    } catch (error) {
      console.error('Error syncing mods:', error)
      throw error
    }
  }
}

export default new ModManager()
