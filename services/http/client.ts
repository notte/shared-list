import { toastStore } from "@/lib/toastStore"
import { Variant } from "@/types/enums"
import { auth } from "@/lib/firebaseClient"

// RequestInit：定義 fetch() 函數的第二個參數 可以傳入哪些設定項目
export interface IHttpClientRequest<T> extends RequestInit {
  url: string
  revalidate?: number
  payload?: T
  successMessage?: string
  cache?: "no-store" | "force-cache"
}

export async function httpClient<T, U>(
  request: IHttpClientRequest<T>,
): Promise<U | undefined> {
  const currentUser = auth.currentUser

  if (!currentUser) {
    toastStore.add(
      Variant.Danger,
      "The user is not logged in and cannot send a request.",
    )
    return undefined
  }
  const idToken = await currentUser.getIdToken()

  const { url, payload, successMessage, revalidate, ...options } = request

  const body = payload ? JSON.stringify(payload) : undefined

  const response = await fetch(url, {
    ...options,
    body,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
      ...options.headers,
    },
    next: {
      revalidate,
    },
  })

  if (!response.ok) {
    let errorText
    switch (response.status) {
      case 400:
        errorText = "Bad request. Please check your input."
        break

      case 401:
        errorText = "Unauthorized. Please log in again."
        break

      case 403:
        errorText = "Forbidden. You don't have permission."
        break

      case 404:
        errorText = "Not found. The resource does not exist."
        break

      case 500:
        errorText = "Server error. Please try again later."
        break

      default:
        errorText = `An unexpected error occurred (${response.status}).`
        break
    }

    toastStore.add(Variant.Danger, response.statusText || errorText)
    return undefined
  }

  if (response.ok && successMessage) {
    toastStore.add(Variant.Success, successMessage)
  }

  return response.json()
}
