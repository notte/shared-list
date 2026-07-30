"use server"
import { getCardDetail } from "@/services/db/card"

export async function getCardForEdit(listId: string, cardId: string) {
  return getCardDetail(listId, cardId)
}
