import Store from 'electron-store'

// Описываем интерфейс всех данных, которые храним
export interface AppSchema {
  // Настройки игры
  minMemory: string
  maxMemory: string
  javaPath: string | null

  // Данные авторизации (Yggdrasil)
  clientToken: string | null // Уникальный ID установки лаунчера
  auth_accessToken: string | null // Токен доступа (живет недолго)
  auth_uuid: string | null // UUID игрока
  auth_name: string | null // Никнейм игрока
}

const store = new Store<AppSchema>({
  defaults: {
    // Дефолтные настройки
    minMemory: '2G',
    maxMemory: '4G',
    javaPath: null,

    // Дефолтная авторизация (пустая)
    clientToken: null,
    auth_accessToken: null,
    auth_uuid: null,
    auth_name: null
  }
})

export default store
