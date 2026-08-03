"use server"
import { db } from "@/lib/firebase.admin"
import { FieldValue } from "firebase-admin/firestore"
import { getUserDataServer } from "@/services/storage/user.server"
import { revalidatePath, revalidateTag, updateTag } from "next/cache"
import { ActionResult } from "@/types/actionResult"

export async function markCardAsRead(
  listId: string,
  cardId: string,
): Promise<ActionResult<void>> {
  const userData = await getUserDataServer()
  if (!userData?.userId) {
    return { success: false, error: "Not authenticated." }
  }

  const cardRef = db
    .collection("lists")
    .doc(listId)
    .collection("cards")
    .doc(cardId)

  const cardDoc = await cardRef.get()

  if (!cardDoc.exists) {
    return { success: false, error: "Card not found." }
  }

  await cardRef.update({ readBy: FieldValue.arrayUnion(userData.userId) })

  revalidatePath(`/lists/${listId}/cards/${cardId}`)
  updateTag(`card-${cardId}`)
  revalidateTag(`card-${cardId}`, { expire: 0 })

  return { success: true, data: undefined }
}
