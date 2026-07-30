"use client"
import { signInAnonymously } from "firebase/auth"
import { auth } from "@/lib/firebase.client"
import { useSyncExternalStore } from "react"
import {
  USER_ID_KEY,
  USER_COLOR_KEY,
  USER_NAME_KEY,
} from "@/services/storage/constants"

// 設定 10 年過期時間，達致永遠保存的效果
const MAX_AGE_10_YEARS = 315360000

// Helper：讀取 Cookie
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null

  // document.cookie 在 JavaScript 中傳回的格式，是一整串用分號（;）隔開的字串
  const cookies = document.cookie.split("; ")

  for (const cookie of cookies) {
    const [key, value] = cookie.split("=")
    if (key === name) {
      return decodeURIComponent(value) // 解碼並回傳
    }
  }

  return null
}

// Helper：寫入 Cookie
function setCookie(name: string, value: string, maxAge: number) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

// Helper：刪除 Cookie
function deleteCookie(name: string) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
}

export async function saveUserData(color: string, userName: string) {
  const { user } = await signInAnonymously(auth)
  const existingUserId = getCookie(USER_ID_KEY)

  // 只有「同一個使用者」才允許覆蓋暱稱／顏色
  // （理論上匿名登入是裝置持久化的，existingUserId 存在時應該永遠等於 user.uid，
  // 這裡保留判斷式是為了讓意圖明確，也防範萬一）
  if (!existingUserId || existingUserId === user.uid) {
    setCookie(USER_ID_KEY, user.uid, MAX_AGE_10_YEARS)
    setCookie(USER_COLOR_KEY, color, MAX_AGE_10_YEARS)
    setCookie(USER_NAME_KEY, userName, MAX_AGE_10_YEARS)
    window.dispatchEvent(new Event("userDataChange"))
  }
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

  // 監聽同一頁面內手動觸發的事件
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
