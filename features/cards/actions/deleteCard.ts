"use server"
import { db } from "@/lib/firebase.admin"
import { getUserDataServer } from "@/services/storage/user.server"
import { ActionResult } from "@/types/actionResult"
import { revalidatePath, revalidateTag, updateTag } from "next/cache"

export async function deleteCard(
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

  const creatorId = cardDoc.data()?.createdBy?.userId

  if (creatorId !== userData.userId) {
    return {
      success: false,
      error: "Only the card creator can delete this card.",
    }
  }

  const batch = db.batch()
  batch.delete(cardRef)
  await batch.commit()

  revalidatePath(`/lists/${listId}`)
  updateTag(`list-${listId}-cards`)
  updateTag(`card-${cardId}`)
  revalidateTag(`list-${listId}-cards`, { expire: 0 })
  revalidateTag(`card-${cardId}`, { expire: 0 })
  return { success: true, data: undefined }
}
