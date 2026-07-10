import { keyof } from "zod"
import { request } from "http"

// RequestInit：定義 fetch() 函數的第二個參數 可以傳入哪些設定項目
export interface IHttpClientRequest<T> extends RequestInit {
  url: string
  revalidate: number
  payload?: T
}

export async function httpClient<T, U>(
  request: IHttpClientRequest<T>,
): Promise<U> {
  const { url, payload, ...options } = request

  const body = payload ? JSON.stringify(payload) : undefined

  const response = await fetch(url, {
    ...options,
    body,
  })

  if (response.status !== 200) {
    throw response.statusText
  }

  return response.json()
}
