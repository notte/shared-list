import { signInAnonymously } from "firebase/auth"
import { auth } from "@/lib/firebaseClient"

const USER_ID_KEY = "anonymous_user_id"

export async function saveUserId() {
  const hasMember = localStorage.getItem(USER_ID_KEY)
  if (hasMember) return

  const { user } = await signInAnonymously(auth)
  localStorage.setItem(USER_ID_KEY, user.uid)
}

export function getUserId(): string | null {
  if (typeof window === "undefined") return null

  const userId = localStorage.getItem(USER_ID_KEY)
  if (userId) return userId
  return null
}

export function clearUserId() {
  const hasMember = localStorage.getItem(USER_ID_KEY)
  if (hasMember) {
    localStorage.removeItem(USER_ID_KEY)
  }
}
