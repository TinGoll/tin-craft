/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs-extra'
import path from 'path'
import * as nbt from 'prismarine-nbt'

interface ServerEntry {
  ip: string
  name: string
  icon?: string
  acceptTextures?: number
}
class ServerListManager {
  // 1. Создаем NBT-объект для одного сервера
  private createServerNbt(s: ServerEntry) {
    return {
      ip: { type: 'string', value: s.ip },
      name: { type: 'string', value: s.name },
      icon: { type: 'string', value: s.icon || '' },
      acceptTextures: { type: 'byte', value: s.acceptTextures ?? 0 }
    }
  }

  // 2. Генератор полной структуры файла из списка серверов
  private generateNbtStructure(servers: ServerEntry[]) {
    const nbtList = servers.map((s) => this.createServerNbt(s))

    return {
      type: 'compound',
      name: '',
      value: {
        servers: {
          type: 'list',
          value: {
            type: 'compound', // Явно указываем тип элементов списка
            value: nbtList
          }
        }
      }
    }
  }

  private parseExistingServers(nbtData: any): ServerEntry[] {
    const serverList: ServerEntry[] = []

    const rootServers = nbtData.value?.servers?.value?.value
    if (!Array.isArray(rootServers)) return []

    for (const item of rootServers) {
      if (item.ip && item.name) {
        serverList.push({
          ip: item.ip.value,
          name: item.name.value,
          icon: item.icon?.value,
          acceptTextures: item.acceptTextures?.value
        })
      }
    }
    return serverList
  }

  public async addServerToList(gameRoot: string, myServer: ServerEntry): Promise<void> {
    const serversDatPath = path.join(gameRoot, 'servers.dat')

    try {
      let currentServers: ServerEntry[] = []

      // Шаг 1: Читаем текущий файл (если есть)
      if (await fs.pathExists(serversDatPath)) {
        try {
          const data = await fs.readFile(serversDatPath)
          const { parsed } = await nbt.parse(data)
          currentServers = this.parseExistingServers(parsed)
        } catch (e) {
          console.warn('servers.dat is corrupted and will be overwritten.')
        }
      }

      const existsIndex = currentServers.findIndex((s) => s.ip === myServer.ip)

      if (existsIndex === -1) {
        console.log('Adding the server to the top of the list...')
        currentServers.unshift(myServer)
      } else {
        /*
            const existing = currentServers.splice(existsIndex, 1)[0];
            currentServers.unshift(existing); 
            console.log('Сервер перемещен на первое место.');
        */

        console.log('The server is already on the list.')
      }

      const finalNbt = this.generateNbtStructure(currentServers)

      const buffer = nbt.writeUncompressed(finalNbt as any)
      await fs.writeFile(serversDatPath, buffer)
    } catch (error) {
      console.error('Critical error updating servers.dat:', error)
      const emergencyNbt = this.generateNbtStructure([myServer])
      const buffer = nbt.writeUncompressed(emergencyNbt as any)
      await fs
        .writeFile(serversDatPath, buffer)
        .catch((e) => console.error('Even the fallback didnt work.', e))
    }
  }
}

export default new ServerListManager()
