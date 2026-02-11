/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { fetcher } from '@renderer/providers/swr/fetcher'
import useSWRMutation from 'swr/mutation'

type LoginArgs = {
  username: string
  password: string
}

type LoginResponse = {
  accessToken: string
  expiresAt: number
  uuid: string
  username: string
}

const loginRequest = async (
  url: string,
  { arg }: { arg: LoginArgs }
): Promise<LoginResponse | null> => {
  try {
    const res = await fetcher<LoginResponse>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(arg)
    })

    return res
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error('An unknown error occurred')
  }
}

export const useLogin = () => {
  const { trigger, data, isMutating, error } = useSWRMutation('/auth/login', loginRequest)

  return {
    trigger,
    data,
    isLoading: isMutating,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : 'An unknown error occurred'
  }
}
