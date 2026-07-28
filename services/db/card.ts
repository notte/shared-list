import {
  GetCardListResponse,
  GetCardDetailResponse,
} from "@/features/cards/adapters/response"
import { toIsoString } from "@/lib/date"
import { db } from "@/lib/firebaseAdmin"
import { cache } from "react"

// 取得指定清單的卡片列表
export const getListCards = cache(
  async (
    listId: string,
    userId: string,
  ): Promise<GetCardListResponse | null> => {
    if (!listId) return null

    try {
      const cardsSnap = await db
        .collection("lists")
        .doc(listId)
        .collection("cards")
        .get()

      const cardsList = cardsSnap.docs.map((doc) => {
        const d = doc.data()

        return {
          cardId: doc.id,
          cardType: d.cardType,
          title: d.title,
          description: d.description,
          createdAt: toIsoString(d.createdAt)!,
          publishTime: toIsoString(d.publishTime)!,
          endTime: toIsoString(d.endTime)!,
          createdBy: d.createdBy,
          readBy: d.readBy,
        }
      })

      const list = cardsList.filter((card) => {
        const isCreator = card.createdBy.userId === userId
        const isPublish = card.publishTime > new Date().toISOString()
        const isEnd = card.endTime < new Date().toISOString()

        // 尚未到達 End 時間
        const isBeforeEnd = !isEnd
        // 或者已到達 End 時間，但是是建立者
        const isEndedButIsCreator = isEnd && isCreator
        // 已到達公開時間
        const isPubliclyReleased = isPublish
        // 未到達公開時間，但是是建立者
        const isUnreleasedButIsCreator = !isPublish && isCreator

        return (
          isBeforeEnd ||
          isEndedButIsCreator ||
          isPubliclyReleased ||
          isUnreleasedButIsCreator
        )
      })

      return {
        cards: list,
        count: list.length,
      }
    } catch (error) {
      console.error(
        `[getListCards] Failed to fetch cards for listId ${listId}:`,
        error,
      )
      return null
    }
  },
)

// 取得指定卡片詳細內容
export const getCardDetail = cache(
  async (
    listId: string,
    cardId: string,
  ): Promise<GetCardDetailResponse | null> => {
    if (!listId || !cardId) return null

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
)
