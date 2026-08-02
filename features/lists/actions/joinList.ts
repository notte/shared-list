"use server"
import { db, auth } from "@/lib/firebase.admin"
import { ActionResult } from "@/types/actionResult"
import { UserRole } from "@/types/enums"
import { FieldValue } from "firebase-admin/firestore"
import { revalidateTag, updateTag } from "next/cache"

export async function joinList(
  idToken: string,
  inviteCode: string,
  userName: string,
  color: string,
): Promise<ActionResult<string>> {
  const decodedToken = await auth.verifyIdToken(idToken)
  const currentUserId = decodedToken.uid

  const inviteRef = db.collection("invites").doc(inviteCode)

  const result = await db.runTransaction<ActionResult<string>>(
    async (transaction) => {
      const inviteSnap = await transaction.get(inviteRef)
      if (!inviteSnap.exists)
        return { success: false, error: "Invalid invitation code." }

      const inviteData = inviteSnap.data()
      if (!inviteData)
        return { success: false, error: "Invalid invitation data." }

      const listId = inviteData.listId
      const listRef = db.collection("lists").doc(listId)
      const memberRef = listRef.collection("members").doc(currentUserId)

      const memberSnap = await transaction.get(memberRef)
      if (memberSnap.exists)
        return { success: false, error: "You are already a member." }

      transaction.update(listRef, {
        [`members.${currentUserId}`]: {
          role: UserRole.Member,
          userName,
          color,
        },
      })
      transaction.set(memberRef, {
        userName,
        color,
        joinedAt: FieldValue.serverTimestamp(),
        role: UserRole.Member,
      })
      transaction.delete(inviteRef)

      return { success: true, data: listId }
    },
  )

  if (!result.success) return result

  updateTag(`list-members-${result.data}`)
  updateTag(`invite-${inviteCode}`)
  revalidateTag(`list-members-${result.data}`, { expire: 0 })
  revalidateTag(`invite-${inviteCode}`, { expire: 0 })

  return result
}
