/* eslint-disable @typescript-eslint/explicit-function-return-type */
import fs from 'fs-extra'
import path from 'path'
import axios from 'axios'
import crypto from 'crypto'
import { app } from 'electron'

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
  private manifestUrl = 'http://localhost:3111/updates/manifest.json' // ТВОЙ URL
  private gameRoot: string

  constructor() {
    this.gameRoot = path.join(app.getPath('userData'), 'minecraft_data')
  }

  private async getFileHash(filePath: string): Promise<string | null> {
    if (!(await fs.pathExists(filePath))) return null

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

    // Определяем папки под управлением (mods, config)
    const managedFolders = new Set<string>()
    remoteFiles.forEach((f) => {
      const firstPart = f.path.split('/')[0]
      if (path.extname(firstPart) === '') managedFolders.add(firstPart)
    })

    const allowedPaths = new Set(
      remoteFiles.map((f) => path.normalize(path.join(this.gameRoot, f.path)))
    )

    async function getLocalFiles(dir: string): Promise<string[]> {
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

    for (const folder of managedFolders) {
      const folderPath = path.join(this.gameRoot, folder)
      const localFiles = await getLocalFiles(folderPath)

      for (const file of localFiles) {
        if (!allowedPaths.has(path.normalize(file))) {
          console.log(`Removing unnecessary: ${file}`)
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

    for (const file of remoteManifest.files) {
      const localPath = path.join(this.gameRoot, file.path)

      const percent = Math.round((processedChecks / totalFiles) * 20)
      onProgress(`Проверка: ${file.path}`, percent)

      const exists = await fs.pathExists(localPath)
      const policy = file.policy || 'overwrite'

      if (!exists) {
        filesToDownload.push(file)
      } else {
        if (policy === 'overwrite') {
          const localHash = await this.getFileHash(localPath)
          if (localHash !== file.sha1) {
            console.log(`Update needed (Hash mismatch): ${file.path}`)
            filesToDownload.push(file)
          }
        } else if (policy === 'once') {
          // Если политика "один раз" и файл существует - ПРОПУСКАЕМ
          // (Мы игнорируем несовпадение хешей, сохраняя настройки игрока)
          // console.log(`Skipping config sync: ${file.path}`);
        }
      }

      processedChecks++
    }

    if (filesToDownload.length === 0) {
      onProgress('Обновлений нет, запуск...', 100)
      return
    }

    let downloadedCount = 0
    const totalDownload = filesToDownload.length

    for (const file of filesToDownload) {
      const destPath = path.join(this.gameRoot, file.path)
      const currentPercent = 20 + Math.round((downloadedCount / totalDownload) * 80)
      onProgress(`Загрузка: ${path.basename(file.path)}`, currentPercent)

      await fs.ensureDir(path.dirname(destPath))

      const writer = fs.createWriteStream(destPath)
      const response = await axios({
        url: file.url,
        method: 'GET',
        responseType: 'stream'
      })

      response.data.pipe(writer)

      await new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        writer.on('finish', resolve)
        writer.on('error', reject)
      })

      downloadedCount++
    }

    await this.cleanUp(remoteManifest.files, onProgress)

    onProgress('Обновление завершено!', 100)
  }

  private async getLocalFiles(dir: string): Promise<string[]> {
    let results: string[] = []
    if (!(await fs.pathExists(dir))) return results

    const list = await fs.readdir(dir)
    for (const file of list) {
      const filePath = path.join(dir, file)
      const stat = await fs.stat(filePath)
      if (stat && stat.isDirectory()) {
        const subFiles = await this.getLocalFiles(filePath)
        results = results.concat(subFiles)
      } else {
        results.push(filePath)
      }
    }
    return results
  }
}

export default new UpdateManager()
