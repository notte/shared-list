"use server"
import { db } from "@/lib/firebase.admin"
import { FieldValue } from "firebase-admin/firestore"
import { getUserDataServer } from "@/services/storage/user.server"
import { revalidatePath, revalidateTag, updateTag } from "next/cache"
import { checkIsListAdmin } from "@/services/db/list"
import { ActionResult } from "@/types/actionResult"

export async function removeMember(
  listId: string,
  deletedUserId: string,
): Promise<ActionResult<void>> {
  const userData = await getUserDataServer()
  if (!userData?.userId) {
    return { success: false, error: "Not authenticated." }
  }

  const isAdmin = await checkIsListAdmin(listId)
  if (!isAdmin) {
    return { success: false, error: "Only administrators can remove members." }
  }

  const listRef = db.collection("lists").doc(listId)
  const listDoc = await listRef.get()

  if (!listDoc.exists) {
    return { success: false, error: "List not found." }
  }

  const memberRef = listRef.collection("members").doc(deletedUserId)
  const memberDoc = await memberRef.get()

  if (!memberDoc.exists) {
    return { success: false, error: "Member not found in this list." }
  }

  const batch = db.batch()

  batch.delete(memberRef)
  batch.update(listRef, {
    [`members.${deletedUserId}`]: FieldValue.delete(),
  })

  await batch.commit()

  revalidatePath(`/lists/${listId}/members`)
  updateTag(`list-members-${listId}`)
  revalidateTag(`list-members-${listId}`, { expire: 0 })
  return { success: true, data: undefined }
}
