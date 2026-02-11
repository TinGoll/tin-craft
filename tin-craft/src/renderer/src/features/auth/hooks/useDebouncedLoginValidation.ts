/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useEffect, useMemo, useState } from 'react'
import { validateLogin } from '../validation/login'
import { debounce } from 'es-toolkit'
import { useCheckLogin } from '../api'

export const useDebouncedLoginValidation = (login: string, delay = 400) => {
  const [error, setError] = useState<string | null>(null)

  const { checkLogin, available, isLoading: isCheckLoginLoading } = useCheckLogin()

  const debouncedValidate = useMemo(
    () =>
      debounce(async (value: string) => {
        const localError = validateLogin(value)

        if (localError) {
          setError(localError)
          return
        }

        await checkLogin({
          login: value
        })
      }, delay),
    [delay, checkLogin]
  )

  useEffect(() => {
    if (!login) {
      debouncedValidate.cancel()
      setError(null)
      return
    }

    debouncedValidate(login)

    return () => {
      debouncedValidate.cancel()
    }
  }, [login, debouncedValidate])

  useEffect(() => {
    if (!available && available !== null) {
      setError('Такой логин уже существует')
    }

    if (available === true) {
      setError(null)
    }
  }, [available])

  return {
    error,
    isValidating: isCheckLoginLoading,
    isValid: !error && !!login
  }
}
