/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import store from './store'

const AUTH_SERVER_URL = 'https://tvoysite.com/api/yggdrasil'

interface AuthProfile {
  id: string // UUID
  name: string // Ник
}

interface AuthResponse {
  accessToken: string
  clientToken: string
  selectedProfile: AuthProfile
  availableProfiles?: AuthProfile[]
}

class AuthManager {
  // 1. Вход по Логину и Паролю
  async login(login: string, pass: string): Promise<AuthResponse> {
    // clientToken - это уникальный ID самой установки лаунчера.
    // Его надо сгенерировать 1 раз и сохранить, чтобы сессия не слетала.
    let clientToken = store.get('clientToken')
    if (!clientToken) {
      clientToken = uuidv4()
      store.set('clientToken', clientToken)
    }

    try {
      // Стандартный запрос Yggdrasil
      const response = await axios.post(`${AUTH_SERVER_URL}/authserver/authenticate`, {
        agent: {
          name: 'Minecraft',
          version: 1
        },
        username: login,
        password: pass,
        clientToken: clientToken,
        requestUser: true
      })

      const data = response.data

      // Сохраняем данные для авто-входа
      store.set('auth_accessToken', data.accessToken)
      store.set('auth_uuid', data.selectedProfile.id)
      store.set('auth_name', data.selectedProfile.name)

      return {
        accessToken: data.accessToken,
        clientToken: data.clientToken,
        selectedProfile: data.selectedProfile
      }
    } catch (error: any) {
      console.error('Authorization error:', error.response?.data || error.message)
      throw new Error('Неверный логин или пароль')
    }
  }

  // 2. Авто-вход (Валидация токена)
  // Проверяет, жив ли токен с прошлого раза
  async validate(): Promise<AuthResponse | null> {
    const accessToken = store.get('auth_accessToken')
    const clientToken = store.get('clientToken')
    const uuid = store.get('auth_uuid')
    const name = store.get('auth_name')

    if (!accessToken || !clientToken || !uuid || !name) return null

    try {
      // Отправляем запрос /validate
      await axios.post(`${AUTH_SERVER_URL}/authserver/validate`, {
        accessToken: accessToken,
        clientToken: clientToken
      })

      // Если сервер ответил 204 No Content, значит токен жив
      return {
        accessToken,
        clientToken: clientToken as string,
        selectedProfile: { id: uuid as string, name: name as string }
      }
    } catch (error) {
      // Если токен протух - пробуем /refresh (иногда токены живут недолго)
      try {
        const refresh = await axios.post(`${AUTH_SERVER_URL}/authserver/refresh`, {
          accessToken: accessToken,
          clientToken: clientToken
        })

        const newData = refresh.data
        store.set('auth_accessToken', newData.accessToken) // Обновляем токен

        return {
          accessToken: newData.accessToken,
          clientToken: newData.clientToken,
          selectedProfile: newData.selectedProfile
        }
      } catch (e) {
        // Если и refresh не помог - сбрасываем вход
        console.log('Session expired')
        return null
      }
    }
  }

  // 3. Выход
  logout() {
    // Можно отправить /invalidate на сервер, но для простоты просто чистим стор
    store.delete('auth_accessToken')
    // clientToken удалять НЕ надо
  }

  // Геттер URL для инжектора
  getAuthServerURL() {
    return AUTH_SERVER_URL
  }
}

export default new AuthManager()
