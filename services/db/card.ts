import {
  GetCardListResponse,
  GetCardDetailResponse,
} from "@/features/cards/adapters/response"
import { toIsoString } from "@/lib/date"
import { db } from "@/lib/firebase.admin"
import { cache } from "react"
import { unstable_cache } from "next/cache"

export const getListCards = cache(
  async (
    listId: string,
    userId: string,
  ): Promise<GetCardListResponse | null> => {
    if (!listId) return null
    const cached = unstable_cache(
      async (): Promise<
        GetCardListResponse & {
          cards: GetCardListResponse["cards"]
        }
      > => {
        try {
          const cardsSnap = await db
            .collection("lists")
            .doc(listId)
            .collection("cards")
            .get()

          const cardsList = cardsSnap.docs.map((doc) => {
            const cardData = doc.data()
            return {
              cardId: doc.id,
              cardType: cardData.cardType,
              title: cardData.title,
              description: cardData.description,
              createdAt: toIsoString(cardData.createdAt)!,
              publishTime: toIsoString(cardData.publishTime)!,
              endTime: toIsoString(cardData.endTime)!,
              createdBy: cardData.createdBy,
              readBy: cardData.readBy,
            }
          })

          return { cards: cardsList, count: cardsList.length }
        } catch (error) {
          console.error(
            `[getListCards] Failed to fetch cards for listId ${listId}:`,
            error,
          )
          return { cards: [], count: 0 }
        }
      },
      ["getListCards", listId],
      { tags: [`list-${listId}-cards`] },
    )

    const result = await cached()
    const now = new Date().toISOString()

    const list = result.cards.filter((card) => {
      const isCreator = card.createdBy.userId === userId
      const isReleased = card.publishTime <= now
      const isEnded = card.endTime < now
      return isCreator || (isReleased && !isEnded)
    })

    return { cards: list, count: list.length }
  },
)

export const getCardDetail = cache(
  async (
    listId: string,
    cardId: string,
  ): Promise<GetCardDetailResponse | null> => {
    if (!listId || !cardId) return null
    const cached = unstable_cache(
      async (): Promise<GetCardDetailResponse | null> => {
        try {
          const cardDetailDoc = await db
            .collection("lists")
            .doc(listId)
            .collection("cards")
            .doc(cardId)
            .get()

          if (!cardDetailDoc.exists) return null

          const rawCardData = cardDetailDoc.data()
          if (!rawCardData) return null

          return {
            cardId: cardDetailDoc.id,
            cardType: rawCardData.cardType,
            title: rawCardData.title,
            description: rawCardData.description,
            content: rawCardData.content,
            createdBy: rawCardData.createdBy,
            createdAt: toIsoString(rawCardData.createdAt)!,
            publishTime: toIsoString(rawCardData.publishTime)!,
            endTime: toIsoString(rawCardData.endTime)!,
            eventTime: toIsoString(rawCardData.eventTime)!,
            eventStartTime: toIsoString(rawCardData.eventStartTime)!,
            eventEndTime: toIsoString(rawCardData.eventEndTime)!,
            readBy: rawCardData.readBy,
            address: rawCardData.address,
            vote: rawCardData.vote,
          }
        } catch (error) {
          console.error(
            `[getCardDetail] Failed to fetch card detail for listId ${listId} and cardId ${cardId}:`,
            error,
          )
          return null
        }
      },
      ["getCardDetail", cardId],
      {
        tags: [`card-${cardId}`],
      },
    )
    return cached()
  },
)
