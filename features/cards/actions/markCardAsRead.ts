"use server"
import { db } from "@/lib/firebase.admin"
import { FieldValue } from "firebase-admin/firestore"
import { getUserDataServer } from "@/services/storage/user.server"
import { revalidatePath } from "next/cache"

export async function markCardAsRead(listId: string, cardId: string) {
  const userData = await getUserDataServer()
  if (!userData?.userId) throw new Error("Not authenticated.")

  const cardRef = db
    .collection("lists")
    .doc(listId)
    .collection("cards")
    .doc(cardId)
  const cardDoc = await cardRef.get()
  if (!cardDoc.exists) throw new Error("Card not found.")

  await cardRef.update({ readBy: FieldValue.arrayUnion(userData.userId) })
  revalidatePath(`/lists/${listId}/cards/${cardId}`)
}
