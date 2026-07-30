"use server"
import { db, auth } from "@/lib/firebase.admin"
import { UserRole } from "@/types/enums"
import { FieldValue } from "firebase-admin/firestore"

export async function joinList(
  idToken: string,
  inviteCode: string,
  userName: string,
  color: string,
): Promise<string> {
  const decodedToken = await auth.verifyIdToken(idToken)
  const currentUserId = decodedToken.uid

  const inviteRef = db.collection("invites").doc(inviteCode)

  let targetListId = ""

  // 使用 Transaction 確保整套權限寫入的一致性
  await db.runTransaction(async (transaction) => {
    // 1. 【讀取與驗證階段】（所有的 get 都放這裡）
    const inviteSnap = await transaction.get(inviteRef)

    if (!inviteSnap.exists) {
      throw new Error("Invalid invitation code.")
    }

    const inviteData = inviteSnap.data()
    if (!inviteData) {
      throw new Error("This invitation code has been used or has expired.")
    }

    targetListId = inviteData.listId

    const listRef = db.collection("lists").doc(targetListId)
    const memberRef = listRef.collection("members").doc(currentUserId)

    const memberSnap = await transaction.get(memberRef)
    if (memberSnap.exists) throw new Error("You are already a member.")

    // 2. 【寫入與刪除階段】
    transaction.update(listRef, {
      [`members.${currentUserId}`]: {
        role: UserRole.Member,
        userName: userName,
        color: color,
      },
    })

    transaction.set(memberRef, {
      userName,
      color,
      joinedAt: FieldValue.serverTimestamp(),
      role: UserRole.Member,
    })

    transaction.delete(inviteRef)
  })

  return targetListId
}
