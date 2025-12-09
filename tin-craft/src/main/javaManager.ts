import fs from 'fs-extra'
import path from 'path'
import axios from 'axios'
import AdmZip from 'adm-zip'
import { app } from 'electron'
// import os from 'os'

// Тип для колбэка прогресса
type ProgressCallback = (status: string, percent: number) => void

class JavaManager {
  private rootDir: string
  private javaExec: string

  constructor() {
    // Путь: %AppData%/YourApp/runtime/java21
    this.rootDir = path.join(app.getPath('userData'), 'runtime', 'java21')
    this.javaExec = this.getJavaExecutablePath()
  }

  private getJavaExecutablePath(): string {
    const isWin = process.platform === 'win32'
    // Базовый путь внутри папки
    const bin = isWin ? 'bin/java.exe' : 'bin/java'
    return path.join(this.rootDir, bin)
  }

  public async checkJava(): Promise<string | null> {
    const exists = await fs.pathExists(this.javaExec)
    return exists ? this.javaExec : null
  }

  private async getDownloadUrl(): Promise<string> {
    // Маппинг платформы Node.js на параметры API Adoptium
    const osMap: Record<string, string> = {
      win32: 'windows',
      darwin: 'mac',
      linux: 'linux'
    }
    const archMap: Record<string, string> = {
      x64: 'x64',
      arm64: 'aarch64'
    }

    const platform = osMap[process.platform]
    const arch = archMap[process.arch]

    if (!platform || !arch) {
      throw new Error(`Platform ${process.platform} or Arch ${process.arch} is not supported.`)
    }

    const url = `https://api.adoptium.net/v3/assets/feature_releases/21/ga?architecture=${arch}&heap_size=normal&image_type=jre&jvm_impl=hotspot&os=${platform}&project=jdk&vendor=eclipse`

    const response = await axios.get(url)

    // Проверяем структуру ответа API
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0].binaries[0].package.link
    }
    throw new Error('API Adoptium не вернуло ссылку на скачивание Java 21')
  }

  public async downloadAndInstall(onProgress: ProgressCallback): Promise<string> {
    // 1. Очистка
    await fs.remove(this.rootDir)
    await fs.ensureDir(this.rootDir)

    // 2. Получение ссылки
    onProgress('Поиск Java 21...', 0)
    const downloadUrl = await this.getDownloadUrl()

    // 3. Скачивание
    const tempZip = path.join(this.rootDir, 'java.zip')
    const writer = fs.createWriteStream(tempZip)

    const response = await axios({
      url: downloadUrl,
      method: 'GET',
      responseType: 'stream'
    })

    const totalLength = parseInt(response.headers['content-length'] || '0', 10)
    let downloaded = 0

    response.data.on('data', (chunk: Buffer) => {
      downloaded += chunk.length
      const percent = totalLength > 0 ? Math.round((downloaded / totalLength) * 100) : 0
      onProgress(`Скачивание Java: ${percent}%`, percent)
    })

    response.data.pipe(writer)

    await new Promise<void>((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })

    // 4. Распаковка
    onProgress('Распаковка архива...', 100)
    // AdmZip синхронный, для больших файлов может блокировать поток, но для JRE ок
    const zip = new AdmZip(tempZip)
    zip.extractAllTo(this.rootDir, true)

    await fs.remove(tempZip)

    // 5. Выравнивание папок (часто внутри zip есть папка jdk-21.x.x, её надо поднять наверх)
    const files = await fs.readdir(this.rootDir)
    const rootFolder = files.find((f) => fs.statSync(path.join(this.rootDir, f)).isDirectory())

    if (rootFolder) {
      const innerPath = path.join(this.rootDir, rootFolder)
      const content = await fs.readdir(innerPath)

      for (const file of content) {
        await fs.move(path.join(innerPath, file), path.join(this.rootDir, file), {
          overwrite: true
        })
      }
      await fs.remove(innerPath)
    }

    // Права на выполнение для Unix
    if (process.platform !== 'win32') {
      await fs.chmod(this.javaExec, 0o755)
    }

    onProgress('Java готова к работе!', 100)
    return this.javaExec
  }
}

export default new JavaManager()
