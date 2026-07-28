import "server-only"
import { cookies } from "next/headers"

const USER_ID_KEY = "anonymous_user_id"
const USER_COLOR = "anonymous_user_color"
const USER_NAME = "anonymous_user_name"

export async function getUserDataServer() {
  const cookieStore = await cookies()

  const userId = cookieStore.get(USER_ID_KEY)?.value
  const color = cookieStore.get(USER_COLOR)?.value
  const rawUserName = cookieStore.get(USER_NAME)?.value
  const userName = rawUserName ? decodeURIComponent(rawUserName) : null

  if (!userId || !color || !userName) {
    return null
  }

  return { userId, color, userName }
}
