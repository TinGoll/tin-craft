/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { fetcher } from '@renderer/providers/swr/fetcher'
import useSWRMutation from 'swr/mutation'

type RegisterArgs = {
  username: string
  password: string
}

type RegisterResponse = {
  success: boolean
  message: string
}

export const register = async (
  url: string,
  { arg }: { arg: RegisterArgs }
): Promise<RegisterResponse | null> => {
  try {
    const res = await fetcher<RegisterResponse>(url, {
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

export const useRegister = () => {
  const { trigger, data, isMutating, error } = useSWRMutation('/auth/register', register)

  return {
    trigger,
    data,
    isLoading: isMutating,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : 'An unknown error occurred'
  }
}
