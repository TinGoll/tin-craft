import fs from 'fs-extra'
import path from 'path'
import { app } from 'electron'

class ModManager {
  private sourceModsDir: string

  constructor() {
    if (app.isPackaged) {
      this.sourceModsDir = path.join(process.resourcesPath, 'resources', 'mods')
    } else {
      this.sourceModsDir = path.join(process.cwd(), 'resources', 'mods')
    }
  }

  async syncMods(gameRoot: string): Promise<void> {
    const targetModsDir = path.join(gameRoot, 'mods')

    try {
      await fs.ensureDir(targetModsDir)
      // 1. Чистим папку mods в папке игры
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
