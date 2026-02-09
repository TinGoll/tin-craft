export type AuthActions = {
  init: () => Promise<void>
  login: (user: string, token: string) => Promise<void>
  logout: () => Promise<void>
}

export type AuthState = {
  user: string | null
  accessToken: string | null
  loading: boolean
} & AuthActions

export const USER_KEY = 'user'
export const TOKEN_KEY = 'accessToken'
