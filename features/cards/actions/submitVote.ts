"use server"
import { db } from "@/lib/firebase.admin"
import { FieldValue } from "firebase-admin/firestore"
import { getUserDataServer } from "@/services/storage/user.server"
import { revalidatePath, revalidateTag, updateTag } from "next/cache"
import { Vote, VoteOption } from "@/features/cards/schemas/card.schema"
import { ActionResult } from "@/types/actionResult"

export async function submitVote(
  listId: string,
  cardId: string,
  optionIds: string[],
): Promise<ActionResult<void>> {
  const userData = await getUserDataServer()
  if (!userData?.userId) {
    return { success: false, error: "Not authenticated." }
  }

  const cardRef = db
    .collection("lists")
    .doc(listId)
    .collection("cards")
    .doc(cardId)
  const voteRecordRef = cardRef.collection("voteRecords").doc(userData.userId)

  const result = await db.runTransaction<ActionResult<void>>(
    async (transaction) => {
      const cardSnap = await transaction.get(cardRef)
      const oldRecordSnap = await transaction.get(voteRecordRef)

      if (!cardSnap.exists) {
        return { success: false, error: "Card not found." }
      }

      const cardData = cardSnap.data()
      const voteData = cardData?.vote as Vote | undefined

      if (!voteData || !voteData.options) {
        return {
          success: false,
          error: "Vote configuration not found on this card.",
        }
      }

      const oldOptionIds: string[] = oldRecordSnap.exists
        ? oldRecordSnap.data()?.optionIds || []
        : []

      const updatedOptions = JSON.parse(
        JSON.stringify(voteData.options),
      ) as VoteOption[]
      let isChanged = false

      for (const option of updatedOptions) {
        const wasSelected = oldOptionIds.includes(option.voteOptionId)
        const isSelected = optionIds.includes(option.voteOptionId)

        if (wasSelected && !isSelected) {
          option.voteCount = Math.max(0, option.voteCount - 1)
          isChanged = true
        } else if (!wasSelected && isSelected) {
          option.voteCount = (option.voteCount || 0) + 1
          isChanged = true
        }
      }

      transaction.set(
        voteRecordRef,
        { optionIds, updatedAt: FieldValue.serverTimestamp() },
        { merge: true },
      )

      if (isChanged) {
        transaction.update(cardRef, { "vote.options": updatedOptions })
      }

      return { success: true, data: undefined }
    },
  )

  if (!result.success) return result

  revalidatePath(`/lists/${listId}/cards/${cardId}`)
  updateTag(`card-${cardId}`)
  revalidateTag(`card-${cardId}`, { expire: 0 })

  return result
}
