"use server"
import { db } from "@/lib/firebase.admin"
import { FieldValue } from "firebase-admin/firestore"
import { getUserDataServer } from "@/services/storage/user.server"
import { revalidatePath, revalidateTag, updateTag } from "next/cache"

export async function createInvite(listId: string) {
  const userData = await getUserDataServer()
  if (!userData?.userId) throw new Error("Not authenticated.")

  const listRef = db.collection("lists").doc(listId)
  const listDoc = await listRef.get()

  if (!listDoc.exists) throw new Error("List not found.")

  const listData = listDoc.data()
  const isCreator = listData?.createdBy.userId === userData.userId

  if (!isCreator)
    throw new Error("Only administrators can generate invite codes.")

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
  return inviteCode
}
