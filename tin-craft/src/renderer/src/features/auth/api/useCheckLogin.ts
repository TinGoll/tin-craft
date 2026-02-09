/* eslint-disable @typescript-eslint/explicit-function-return-type */
import useSWRMutation from 'swr/mutation'

type CheckLoginResponse = {
  exists: boolean
}

async function checkLogin(
  url: string,
  { arg }: { arg: { login: string } }
): Promise<CheckLoginResponse> {
  const res = await fetch(`${url}?login=${encodeURIComponent(arg.login)}`)

  if (!res.ok) {
    throw new Error('Request failed')
  }

  return res.json()
}

export const useCheckLogin = () => {
  const { trigger, data, isMutating, error } = useSWRMutation('/auth/check-login', checkLogin)

  return {
    checkLogin: trigger,
    exists: data?.exists ?? null,
    isLoading: isMutating,
    isError: Boolean(error)
  }
}
