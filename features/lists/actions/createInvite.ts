"use server"
import { db } from "@/lib/firebase.admin"
import { FieldValue } from "firebase-admin/firestore"
import { getUserDataServer } from "@/services/storage/user.server"
import { revalidatePath, revalidateTag, updateTag } from "next/cache"
import { ActionResult } from "@/types/actionResult"

export async function createInvite(
  listId: string,
): Promise<ActionResult<void>> {
  const userData = await getUserDataServer()
  if (!userData?.userId)
    return { success: false, error: "User not authenticated." }

  const listRef = db.collection("lists").doc(listId)
  const listDoc = await listRef.get()

  if (!listDoc.exists) return { success: false, error: "List not found." }

  const listData = listDoc.data()
  const isCreator = listData?.createdBy.userId === userData.userId

  if (!isCreator)
    return {
      success: false,
      error: "Only administrators can generate invite codes.",
    }

  const inviteCode = crypto.randomUUID()

  await db.collection("invites").doc(inviteCode).set({
    listId: listId,
    title: listData?.title,
    creator: listData?.createdBy.userName,
    createdAt: FieldValue.serverTimestamp(),
    expiredAt: null,
  })

  revalidatePath(`/lists/${listId}/members`)
  updateTag(`list-${listId}-invites`)
  revalidateTag(`list-${listId}-invites`, { expire: 0 })

  return { success: true, data: undefined }
}
