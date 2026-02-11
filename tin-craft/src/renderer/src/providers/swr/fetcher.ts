const BASE_URL = import.meta.env.VITE_API_URL

export async function fetcher<T>(input: string, init?: RequestInit): Promise<T | null> {
  const res = await window.api.fetch<T>(`${BASE_URL}${input}`, init)
  if (!res.success) {
    throw new Error(res.error || 'Unknown error')
  }

  return res.data
}
