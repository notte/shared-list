"use server"
import { db } from "@/lib/firebase.admin"
import { getUserDataServer } from "@/services/storage/user.server"
import { revalidatePath, revalidateTag, updateTag } from "next/cache"
import { checkIsListAdmin } from "@/services/db/list"
import { ActionResult } from "@/types/actionResult"

export async function deleteInvite(
  listId: string,
  inviteCode: string,
): Promise<ActionResult<void>> {
  const userData = await getUserDataServer()
  if (!userData?.userId) {
    return { success: false, error: "User not authenticated." }
  }

  const isAdmin = await checkIsListAdmin(listId)
  if (!isAdmin) {
    return {
      success: false,
      error: "Only administrators can delete invite codes.",
    }
  }

  const inviteRef = db.collection("invites").doc(inviteCode)
  const inviteDoc = await inviteRef.get()

  if (!inviteDoc.exists) {
    return { success: false, error: "Invitation code not found." }
  }

  await inviteRef.delete()

  revalidatePath(`/lists/${listId}/members`)
  updateTag(`list-${listId}-invites`)
  updateTag(`invite-${inviteCode}`)
  revalidateTag(`list-${listId}-invites`, { expire: 0 })
  revalidateTag(`invite-${inviteCode}`, { expire: 0 })
  return { success: true, data: undefined }
}
