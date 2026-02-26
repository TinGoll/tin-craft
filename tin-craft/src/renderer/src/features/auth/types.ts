export type AuthActions = {
  init: () => Promise<void>
  login: (user: string, token: string) => Promise<void>
  logout: () => Promise<void>
  setHasFirstLaunch: (value: boolean) => Promise<void>
  addSuccessLoginUser: (username: string, pass: string) => Promise<void>
  removeSuccessLoginUser: (username: string) => Promise<void>
}

export type AuthState = {
  user: string | null
  accessToken: string | null
  loading: boolean
  hasFirstLaunch: boolean
  lastSuccessLoginUsers: Record<string, string>
} & AuthActions

export const USER_KEY = 'user'
export const TOKEN_KEY = 'accessToken'
export const FIRST_LAUNCH_KEY = 'hasFirstLaunch'
export const LAST_SUCCESS_LOGIN_USERS_KEY = 'lastSuccessLoginUsers'
