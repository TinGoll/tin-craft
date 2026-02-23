/* eslint-disable @typescript-eslint/explicit-function-return-type */
import fs from 'fs-extra'
import path from 'path'
import axios from 'axios'
import crypto from 'crypto'
import { app } from 'electron'
import { pipeline } from 'stream/promises'

interface FileEntry {
  path: string
  url: string
  sha1: string
  size: number
  policy?: 'overwrite' | 'once'
}

interface Manifest {
  files: FileEntry[]
}

type ProgressCallback = (status: string, percent: number) => void

class UpdateManager {
  private manifestUrl = 'http://localhost:3111/updates/manifest.json'
  private gameRoot: string

  private strictFolders = ['mods']

  constructor() {
    this.gameRoot = path.join(app.getPath('userData'), 'minecraft_data')
  }

  private async getFileHash(filePath: string): Promise<string | null> {
    if (!(await fs.pathExists(filePath))) {
      return null
    }

    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha1')
      const stream = fs.createReadStream(filePath)

      stream.on('data', (data) => hash.update(data))
      stream.on('end', () => resolve(hash.digest('hex')))
      stream.on('error', reject)
    })
  }

  private async cleanUp(remoteFiles: FileEntry[], onProgress: ProgressCallback) {
    onProgress('Очистка файлов...', 95)

    const allowedPaths = new Set(
      remoteFiles.map((f) => path.normalize(path.join(this.gameRoot, f.path)))
    )

    const getLocalFiles = async (dir: string): Promise<string[]> => {
      let results: string[] = []
      if (!(await fs.pathExists(dir))) return results
      const list = await fs.readdir(dir)
      for (const file of list) {
        const filePath = path.join(dir, file)
        const stat = await fs.stat(filePath)
        if (stat.isDirectory()) {
          results = results.concat(await getLocalFiles(filePath))
        } else {
          results.push(filePath)
        }
      }
      return results
    }

    for (const folder of this.strictFolders) {
      const folderPath = path.join(this.gameRoot, folder)
      const localFiles = await getLocalFiles(folderPath)

      for (const file of localFiles) {
        if (!allowedPaths.has(path.normalize(file))) {
          console.log(`Removing an unnecessary file: ${file}`)
          await fs.unlink(file)
        }
      }
    }
  }

  public async checkForUpdates(onProgress: ProgressCallback): Promise<void> {
    onProgress('Получение списка файлов...', 0)

    let remoteManifest: Manifest
    try {
      const response = await axios.get(this.manifestUrl)
      remoteManifest = response.data
    } catch (e) {
      console.error(e)
      throw new Error('Failed to retrieve update list from server.')
    }

    const filesToDownload: FileEntry[] = []
    const totalFiles = remoteManifest.files.length
    let processedChecks = 0

    // Проверка файлов
    for (const file of remoteManifest.files) {
      const localPath = path.join(this.gameRoot, file.path)

      // Прогресс проверки: от 0 до 10%
      const percent = Math.round((processedChecks / totalFiles) * 10)
      onProgress(`Проверка: ${path.basename(file.path)}`, percent)

      const exists = await fs.pathExists(localPath)
      const policy = file.policy || 'overwrite'

      if (!exists) {
        filesToDownload.push(file)
      } else {
        if (policy === 'overwrite') {
          const localHash = await this.getFileHash(localPath)
          if (localHash !== file.sha1) {
            console.log(`Нужно обновить (хэш не совпадает): ${file.path}`)
            filesToDownload.push(file)
          }
        } else if (policy === 'once') {
          console.log(`Пропуск (файл уже существует): ${file.path}`)
        }
      }

      processedChecks++
    }

    if (filesToDownload.length === 0) {
      await this.cleanUp(remoteManifest.files, onProgress)
      onProgress('Обновлений нет, запуск...', 100)
      return
    }

    // Подготовка к скачиванию (Считаем общий размер для плавного прогресса)
    const totalBytesToDownload = filesToDownload.reduce((acc, file) => acc + file.size, 0)
    let downloadedBytes = 0

    for (const file of filesToDownload) {
      const destPath = path.join(this.gameRoot, file.path)
      const tmpPath = `${destPath}.tmp` // Временный файл

      await fs.ensureDir(path.dirname(destPath))

      const response = await axios({
        url: file.url,
        method: 'GET',
        responseType: 'stream'
      })

      response.data.on('data', (chunk: Buffer) => {
        downloadedBytes += chunk.length
        // Прогресс скачивания: от 10% до 95%
        const currentPercent = 10 + Math.round((downloadedBytes / totalBytesToDownload) * 85)
        // Ограничиваем 95%, чтобы оставить место для этапа очистки
        onProgress(`Загрузка: ${path.basename(file.path)}`, Math.min(currentPercent, 95))
      })

      const writer = fs.createWriteStream(tmpPath)

      try {
        await pipeline(response.data, writer)
        await fs.rename(tmpPath, destPath)
      } catch (err) {
        console.error(`Ошибка при скачивании ${file.path}:`, err)
        if (await fs.pathExists(tmpPath)) {
          await fs.unlink(tmpPath)
        }
        throw new Error(`Ошибка скачивания файла: ${file.path}`)
      }
    }

    await this.cleanUp(remoteManifest.files, onProgress)

    onProgress('Обновление завершено!', 100)
  }
}

export default new UpdateManager()
