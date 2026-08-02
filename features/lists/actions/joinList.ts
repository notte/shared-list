"use server"
import { db, auth } from "@/lib/firebase.admin"
import { UserRole } from "@/types/enums"
import { FieldValue } from "firebase-admin/firestore"
import { revalidateTag, updateTag } from "next/cache"

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

  await db.runTransaction(async (transaction) => {
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

  updateTag(`list-members-${targetListId}`)
  updateTag(`invite-${inviteCode}`)
  revalidateTag(`list-members-${targetListId}`, { expire: 0 })
  revalidateTag(`invite-${inviteCode}`, { expire: 0 })
  return targetListId
}
