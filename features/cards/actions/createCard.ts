"use server"
import { parseToDate } from "@/lib/date"
import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { CardRequest } from "@/features/cards/adapters/request"
import { getUserDataServer } from "@/services/storage/user.server"
import { CardType } from "@/types/enums"
import { db } from "@/lib/firebase.admin"
import { revalidatePath, revalidateTag, updateTag } from "next/cache"
import { ActionResult } from "@/types/actionResult"

function parseToTimestamp(value: unknown): Timestamp | null {
  const date = parseToDate(value)
  return date ? Timestamp.fromDate(date) : null
}

export async function createCard(
  listId: string,
  data: CardRequest,
): Promise<ActionResult<string>> {
  const userData = await getUserDataServer()
  if (!userData?.userId) {
    return { success: false, error: "Not authenticated." }
  }

  const {
    title,
    content,
    cardType,
    description,
    publishTime,
    endTime,
    eventTime,
    eventStartTime,
    eventEndTime,
    address,
  } = data

  const vote = data.cardType === CardType.Vote ? data.vote : null

  const newCardRef = db
    .collection("lists")
    .doc(listId)
    .collection("cards")
    .doc()

  const newCardId = newCardRef.id
  const batch = db.batch()

  const newCardData = {
    cardId: newCardId,
    title,
    description,
    content,
    cardType,
    publishTime: parseToTimestamp(publishTime),
    endTime: parseToTimestamp(endTime),
    eventTime: parseToTimestamp(eventTime),
    eventStartTime: parseToTimestamp(eventStartTime),
    eventEndTime: parseToTimestamp(eventEndTime),
    address,
    vote,
    createdAt: FieldValue.serverTimestamp(),
    createdBy: {
      userName: userData.userName,
      color: userData.color,
      userId: userData.userId,
    },
    readBy: [userData.userId],
  }

  batch.set(newCardRef, newCardData)
  await batch.commit()

  revalidatePath(`/lists/${listId}`)
  updateTag(`list-${listId}-cards`)
  revalidateTag(`list-${listId}-cards`, { expire: 0 })

  return { success: true, data: newCardId }
}
