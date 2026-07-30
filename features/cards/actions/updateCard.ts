"use server"
import { CardRequest } from "@/features/cards/adapters/request"
import { db } from "@/lib/firebase.admin"
import { getUserDataServer } from "@/services/storage/user.server"
import { CardType } from "@/types/enums"
import { revalidatePath } from "next/cache"
import { parseToDate } from "@/lib/date"
import { Timestamp } from "firebase-admin/firestore"

function parseToTimestamp(value: unknown): Timestamp | null {
  const date = parseToDate(value)
  return date ? Timestamp.fromDate(date) : null
}

export async function updateCard(
  listId: string,
  cardId: string,
  data: CardRequest,
): Promise<void> {
  const userData = await getUserDataServer()
  if (!userData?.userId) throw new Error("Not authenticated.")

  const cardRef = db
    .collection("lists")
    .doc(listId)
    .collection("cards")
    .doc(cardId)

  const cardDoc = await cardRef.get()

  if (!cardDoc.exists) throw new Error("Card not found.")

  const creatorId = cardDoc.data()?.createdBy?.userId

  if (creatorId !== userData.userId)
    throw new Error("Only the card creator can edit this card.")

  const {
    cardType,
    title,
    description,
    content,
    publishTime,
    endTime,
    eventTime,
    eventStartTime,
    eventEndTime,
    address,
  } = data

  const vote = data.cardType === CardType.Vote ? data.vote : null

  const updatedCardData = {
    cardType,
    title,
    description,
    content,
    publishTime: parseToTimestamp(publishTime),
    endTime: parseToTimestamp(endTime),
    eventTime: parseToTimestamp(eventTime),
    eventStartTime: parseToTimestamp(eventStartTime),
    eventEndTime: parseToTimestamp(eventEndTime),
    address,
    vote,
  }

  await cardRef.set(updatedCardData, { merge: true })

  revalidatePath(`/lists/${listId}`)
  revalidatePath(`/lists/${listId}/cards/${cardId}`)
}
