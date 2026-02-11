import { SWRConfig } from 'swr'
import { fetcher } from './fetcher'
import { FC } from 'react'

export const SWRProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        shouldRetryOnError: false,
        dedupingInterval: 500
      }}
    >
      {children}
    </SWRConfig>
  )
}
