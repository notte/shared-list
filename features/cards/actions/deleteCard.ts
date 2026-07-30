"use server"
import { db } from "@/lib/firebase.admin"
import { getUserDataServer } from "@/services/storage/user.server"
import { revalidatePath } from "next/cache"

export async function deleteCard(listId: string, cardId: string) {
  const userData = await getUserDataServer()
  if (!userData?.userId) throw new Error("Not authenticated.")

  const cardRef = db
    .collection("lists")
    .doc(listId)
    .collection("cards")
    .doc(cardId)

  const cardDoc = await cardRef.get()

  if (!cardDoc.exists) throw new Error("Card not found.")

  const creatorId = cardDoc.data()?.createdBy?.userId

  if (creatorId !== userData.userId)
    throw new Error("Only the card creator can delete this card.")

  const batch = db.batch()
  batch.delete(cardRef)
  await batch.commit()

  revalidatePath(`/lists/${listId}`)
}
