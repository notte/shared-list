"use server"
import { db } from "@/lib/firebase.admin"
import { FieldValue } from "firebase-admin/firestore"
import { getUserDataServer } from "@/services/storage/user.server"
import { revalidatePath, updateTag } from "next/cache"
import { checkIsListAdmin } from "@/services/db/list"

export async function removeMember(listId: string, deletedUserId: string) {
  const userData = await getUserDataServer()
  if (!userData?.userId) throw new Error("Not authenticated.")

  const isAdmin = await checkIsListAdmin(listId)
  if (!isAdmin) throw new Error("Only administrators can remove members.")

  const listRef = db.collection("lists").doc(listId)
  const listDoc = await listRef.get()

  if (!listDoc.exists) throw new Error("List not found.")

  const memberRef = listRef.collection("members").doc(deletedUserId)
  const memberDoc = await memberRef.get()

  if (!memberDoc.exists) throw new Error("Member not found in this list.")

  const batch = db.batch()

  batch.delete(memberRef)
  batch.update(listRef, {
    [`members.${deletedUserId}`]: FieldValue.delete(),
  })

  await batch.commit()

  revalidatePath(`/lists/${listId}/members`)
  updateTag(`list-members-${listId}`)
}
