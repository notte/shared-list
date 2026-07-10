import { toastStore } from "@/lib/toastStore"
import { EventType } from "@/types/enums"

// RequestInit：定義 fetch() 函數的第二個參數 可以傳入哪些設定項目
export interface IHttpClientRequest<T> extends RequestInit {
  url: string
  revalidate: number
  payload?: T
  successMessage?: string
}

export async function httpClient<T, U>(
  request: IHttpClientRequest<T>,
): Promise<U> {
  const { url, payload, successMessage, revalidate, ...options } = request

  const body = payload ? JSON.stringify(payload) : undefined

  const response = await fetch(url, {
    ...options,
    body,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    next: {
      revalidate,
    },
  })

  if (!response.ok) {
    toastStore.add(EventType.Danger, response.statusText)
    throw new Error(response.statusText)
  }

  if (response.ok && successMessage) {
    toastStore.add(EventType.Success, successMessage)
  }

  return response.json()
}
