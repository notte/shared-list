"use server"
import { db } from "@/lib/firebase.admin"
import { FieldValue } from "firebase-admin/firestore"
import { getUserDataServer } from "@/services/storage/user.server"
import { revalidatePath } from "next/cache"

export async function createInvite(listId: string) {
  const userData = await getUserDataServer()
  if (!userData?.userId) throw new Error("Not authenticated.")

  const listRef = db.collection("lists").doc(listId)
  const listDoc = await listRef.get()

  if (!listDoc.exists) throw new Error("List not found.")

  const listData = listDoc.data()
  const isCreator = listData?.createdBy.userId === userData.userId
  // const memberInfo = listData?.members?.[userData.userId] 未來可能多個 admin 情況

  if (!isCreator)
    throw new Error("Only administrators can generate invite codes.")

  const inviteCode = crypto.randomUUID()

  await db.collection("invites").doc(inviteCode).set({
    listId: listId,
    title: listData?.title,
    creator: listData?.createdBy.userName,
    createdAt: FieldValue.serverTimestamp(),
    expiredAt: null, // 先預設永不過期，作廢時直接由管理員下 DELETE 即可
  })

  revalidatePath(`/lists/${listId}/members`)
  return inviteCode
}
