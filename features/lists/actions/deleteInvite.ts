"use server"
import { db } from "@/lib/firebase.admin"
import { getUserDataServer } from "@/services/storage/user.server"
import { revalidatePath, updateTag } from "next/cache"
import { checkIsListAdmin } from "@/services/db/list"

export async function deleteInvite(listId: string, inviteCode: string) {
  const userData = await getUserDataServer()
  if (!userData?.userId) throw new Error("Not authenticated.")

  const isAdmin = await checkIsListAdmin(listId)
  if (!isAdmin) throw new Error("Only administrators can delete invite codes.")

  const inviteRef = db.collection("invites").doc(inviteCode)
  const inviteDoc = await inviteRef.get()

  if (!inviteDoc.exists) throw new Error("Invitation code not found.")

  await inviteRef.delete()

  revalidatePath(`/lists/${listId}/members`)
  updateTag(`list-${listId}-invites`)
  updateTag(`invite-${inviteCode}`)
}
