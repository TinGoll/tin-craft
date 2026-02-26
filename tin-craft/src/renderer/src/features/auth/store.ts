/* eslint-disable @typescript-eslint/no-unused-vars */
import { createStore } from 'zustand'
import {
  AuthState,
  FIRST_LAUNCH_KEY,
  LAST_SUCCESS_LOGIN_USERS_KEY,
  TOKEN_KEY,
  USER_KEY
} from './types'

export const authStore = createStore<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  loading: true,
  hasFirstLaunch: false,
  lastSuccessLoginUsers: {},
  init: async () => {
    set({ loading: true })

    try {
      const [user, token, hasFirstLaunch, lastSuccessLoginUsers] = await Promise.all([
        window.api.store.get<string>(USER_KEY),
        window.api.store.get<string>(TOKEN_KEY),
        window.api.store.get<boolean>(FIRST_LAUNCH_KEY),
        window.api.store.get<Record<string, string>>(LAST_SUCCESS_LOGIN_USERS_KEY)
      ])

      set({
        user: user ?? null,
        accessToken: token ?? null,
        hasFirstLaunch: hasFirstLaunch ?? false,
        lastSuccessLoginUsers: lastSuccessLoginUsers ?? {},
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
  },
  setHasFirstLaunch: async (value) => {
    set({ hasFirstLaunch: value })
    try {
      await window.api.store.set(FIRST_LAUNCH_KEY, value)
    } catch (e) {
      console.error('Set hasFirstLaunch persist failed', e)
    }
  },
  addSuccessLoginUser: async (username, pass) => {
    set((state) => {
      const updatedUsers = { ...state.lastSuccessLoginUsers, [username.toLowerCase()]: pass }
      window.api.store.set(LAST_SUCCESS_LOGIN_USERS_KEY, updatedUsers).catch((e) => {
        console.error('Add success login user persist failed', e)
      })
      return { lastSuccessLoginUsers: updatedUsers }
    })
  },
  removeSuccessLoginUser: async (username) => {
    set((state) => {
      const { [username.toLowerCase()]: _, ...updatedUsers } = state.lastSuccessLoginUsers
      window.api.store.set(LAST_SUCCESS_LOGIN_USERS_KEY, updatedUsers).catch((e) => {
        console.error('Remove success login user persist failed', e)
      })
      return { lastSuccessLoginUsers: updatedUsers }
    })
  }
}))
