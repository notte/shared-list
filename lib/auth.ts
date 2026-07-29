import { db } from "@/lib/firebaseAdmin"
import { getUserDataServer } from "@/services/storage/user.server"

export async function checkUserInList(listId: string): Promise<boolean> {
  const userData = await getUserDataServer()
  if (!listId || !userData) return false

  try {
    const memberDoc = await db
      .collection("lists")
      .doc(listId)
      .collection("members")
      .doc(userData?.userId)
      .get()

    return memberDoc.exists
  } catch (error) {
    console.error("Check user in list failed:", error)
    return false
  }
}
