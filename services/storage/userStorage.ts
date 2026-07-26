import { signInAnonymously } from "firebase/auth"
import { auth } from "@/lib/firebaseClient"
import { useSyncExternalStore } from "react"

const USER_ID_KEY = "anonymous_user_id"
const USER_COLOR = "anonymous_user_color"
const USER_NAME = "anonymous_user_name"

export async function saveUserData(color: string, userName: string) {
  const hasMember =
    localStorage.getItem(USER_ID_KEY) &&
    localStorage.getItem(USER_COLOR) &&
    localStorage.getItem(USER_NAME)
  if (hasMember) return

  const { user } = await signInAnonymously(auth)

  localStorage.setItem(USER_ID_KEY, user.uid)
  localStorage.setItem(USER_COLOR, color)
  localStorage.setItem(USER_NAME, userName)

  window.dispatchEvent(new Event("userDataChange"))
}

export function clearUserId() {
  const hasMember =
    localStorage.getItem(USER_ID_KEY) &&
    localStorage.getItem(USER_COLOR) &&
    localStorage.getItem(USER_NAME)
  if (hasMember) {
    localStorage.removeItem(USER_ID_KEY)
    localStorage.removeItem(USER_COLOR)
    localStorage.removeItem(USER_NAME)
    window.dispatchEvent(new Event("userDataChange"))
  }
}

let cachedUserData: { userName: string; color: string; userId: string } | null =
  null

export function getUserData() {
  if (typeof window === "undefined") return null

  const userId = localStorage.getItem(USER_ID_KEY)
  const color = localStorage.getItem(USER_COLOR)
  const userName = localStorage.getItem(USER_NAME)

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

  // 自訂事件
  window.addEventListener("userDataChange", callback)
  // 瀏覽器內建事件，監聽跨分頁的 localStorage 變更
  window.addEventListener("storage", callback)

  return () => {
    window.removeEventListener("userDataChange", callback)
    window.removeEventListener("storage", callback)
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
