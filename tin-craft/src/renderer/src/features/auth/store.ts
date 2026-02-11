import { createStore } from 'zustand'
import { AuthState, TOKEN_KEY, USER_KEY } from './types'

export const authStore = createStore<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  loading: true,
  init: async () => {
    set({ loading: true })

    try {
      const [user, token] = await Promise.all([
        window.api.store.get<string>(USER_KEY),
        window.api.store.get<string>(TOKEN_KEY)
      ])

      set({
        user: user ?? null,
        accessToken: token ?? null,
        loading: false
      })
    } catch (e) {
      console.error('Auth init failed', e)
      set({ user: null, accessToken: null, loading: false })
    }
  },
  login: async (user, token) => {
    set({ user, accessToken: token })

    try {
      await Promise.all([
        window.api.store.set(USER_KEY, user),
        window.api.store.set(TOKEN_KEY, token)
      ])
    } catch (e) {
      console.error('Login persist failed', e)
    }
  },
  logout: async () => {
    set({ user: null, accessToken: null })

    try {
      await Promise.all([window.api.store.delete(USER_KEY), window.api.store.delete(TOKEN_KEY)])
    } catch (e) {
      console.error('Logout persist failed', e)
    }
  }
}))
