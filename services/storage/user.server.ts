import "server-only"
import { cookies } from "next/headers"
import {
  USER_ID_KEY,
  USER_COLOR_KEY,
  USER_NAME_KEY,
} from "@/services/storage/constants"

export async function getUserDataServer() {
  const cookieStore = await cookies()

  const userId = cookieStore.get(USER_ID_KEY)?.value
  const color = cookieStore.get(USER_COLOR_KEY)?.value
  const rawUserName = cookieStore.get(USER_NAME_KEY)?.value
  const userName = rawUserName ? decodeURIComponent(rawUserName) : null

  if (!userId || !color || !userName) {
    return null
  }

  return { userId, color, userName }
}
