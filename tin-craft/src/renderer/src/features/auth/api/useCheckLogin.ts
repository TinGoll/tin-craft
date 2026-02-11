/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { fetcher } from '@renderer/providers/swr/fetcher'
import useSWRMutation from 'swr/mutation'

type CheckLoginResponse = {
  available: boolean
}

async function checkLogin(
  url: string,
  { arg }: { arg: { login: string } }
): Promise<CheckLoginResponse> {
  try {
    const res = await fetcher<CheckLoginResponse>(`${url}?login=${encodeURIComponent(arg.login)}`)
    return { available: Boolean(res?.available) }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error('Failed to check login availability')
  }
}

export const useCheckLogin = () => {
  const { trigger, data, isMutating, error } = useSWRMutation('/auth/check-login', checkLogin)

  return {
    checkLogin: trigger,
    available: data?.available ?? null,
    isLoading: isMutating,
    isError: Boolean(error)
  }
}
