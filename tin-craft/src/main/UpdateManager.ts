import fs from 'fs-extra'
import path from 'path'
import axios from 'axios'
import crypto from 'crypto'
import { app } from 'electron'

interface FileEntry {
  path: string // "mods/jei.jar"
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

  // Вычисляет SHA1 локального файла
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

  public async checkForUpdates(onProgress: ProgressCallback): Promise<void> {
    onProgress('Получение списка файлов...', 0)

    // 1. Скачиваем манифест
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

    // 2. Сверяем файлы
    for (const file of remoteManifest.files) {
      const localPath = path.join(this.gameRoot, file.path)

      // Сообщаем прогресс
      const percent = Math.round((processedChecks / totalFiles) * 20)
      onProgress(`Проверка: ${file.path}`, percent)

      // --- НОВАЯ ЛОГИКА ---
      const exists = await fs.pathExists(localPath)
      const policy = file.policy || 'overwrite' // Если в манифесте нет поля, считаем overwrite

      if (!exists) {
        // Файла нет - нужно качать в любом случае
        filesToDownload.push(file)
      } else {
        // Файл есть. Смотрим политику.
        if (policy === 'overwrite') {
          // Если политика "перезапись", проверяем хеш
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
      // ---------------------

      processedChecks++
    }

    if (filesToDownload.length === 0) {
      onProgress('Обновлений нет, запуск...', 100)
      return
    }

    // 3. Скачивание файлов
    let downloadedCount = 0
    const totalDownload = filesToDownload.length

    for (const file of filesToDownload) {
      const destPath = path.join(this.gameRoot, file.path)

      // Процент от 20% до 100%
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

    // await this.cleanUp(remoteManifest.files, onProgress)

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

  // Метод очистки
  private async cleanUp(remoteFiles: FileEntry[], onProgress: ProgressCallback): Promise<void> {
    onProgress('Очистка лишних файлов...', 95)

    // 1. Определяем, какие папки мы контролируем (mods, config...)
    // Извлекаем корневые папки из путей в манифесте
    const managedFolders = new Set<string>()
    remoteFiles.forEach((f) => {
      const firstPart = f.path.split('/')[0]
      // Если файл в корне (например forge-installer.jar), то firstPart будет самим файлом.
      // Нас интересуют только папки.
      if (path.extname(firstPart) === '') {
        managedFolders.add(firstPart)
      }
    })

    // 2. Создаем Set из путей, которые ДОЛЖНЫ быть (нормализуем слеши под ОС)
    const allowedPaths = new Set(
      remoteFiles.map((f) => path.normalize(path.join(this.gameRoot, f.path)))
    )

    // 3. Проходимся по всем управляемым папкам
    for (const folder of managedFolders) {
      const folderPath = path.join(this.gameRoot, folder)
      const localFiles = await this.getLocalFiles(folderPath)

      for (const file of localFiles) {
        // Если локального файла нет в списке разрешенных -> удаляем
        if (!allowedPaths.has(path.normalize(file))) {
          console.log(`Removing an unnecessary file: ${file}`)
          await fs.unlink(file)
        }
      }
    }
  }
}

export default new UpdateManager()
