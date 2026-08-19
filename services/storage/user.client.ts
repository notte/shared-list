"use client"
import { useSyncExternalStore } from "react"
import {
  USER_ID_KEY,
  USER_COLOR_KEY,
  USER_NAME_KEY,
} from "@/services/storage/constants"

const MAX_AGE_10_YEARS = 315360000

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null

  const cookies = document.cookie.split("; ")

  for (const cookie of cookies) {
    const [key, value] = cookie.split("=")
    if (key === name) {
      return decodeURIComponent(value)
    }
  }

  return null
}

function setCookie(name: string, value: string, maxAge: number) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
}

export async function saveUserData(
  userId: string,
  color: string,
  userName: string,
) {
  setCookie(USER_ID_KEY, userId, MAX_AGE_10_YEARS)
  setCookie(USER_COLOR_KEY, color, MAX_AGE_10_YEARS)
  setCookie(USER_NAME_KEY, userName, MAX_AGE_10_YEARS)
  window.dispatchEvent(new Event("userDataChange"))
}

export function clearUserId() {
  const hasMember =
    getCookie(USER_ID_KEY) &&
    getCookie(USER_COLOR_KEY) &&
    getCookie(USER_NAME_KEY)
  if (hasMember) {
    deleteCookie(USER_ID_KEY)
    deleteCookie(USER_COLOR_KEY)
    deleteCookie(USER_NAME_KEY)
    window.dispatchEvent(new Event("userDataChange"))
  }
}

let cachedUserData: { userName: string; color: string; userId: string } | null =
  null

export function getUserData() {
  if (typeof window === "undefined") return null

  const userId = getCookie(USER_ID_KEY)
  const color = getCookie(USER_COLOR_KEY)
  const userName = getCookie(USER_NAME_KEY)

  if (!userId || !color || !userName) {
    cachedUserData = null
    return null
  }

  if (
    cachedUserData &&
    cachedUserData.userId === userId &&
    cachedUserData.color === color &&
    cachedUserData.userName === userName
  ) {
    return cachedUserData
  }

  cachedUserData = { userId, userName, color }
  return cachedUserData
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {}

  window.addEventListener("userDataChange", callback)

  return () => {
    window.removeEventListener("userDataChange", callback)
  }
}

export function useUserData() {
  const snapshot = useSyncExternalStore(subscribe, getUserData, () => null)

  if (snapshot) {
    return {
      userName: snapshot.userName,
      userId: snapshot.userId,
      color: snapshot.color,
    }
  }
}
