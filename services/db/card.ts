import { GetCardListResponse } from "@/features/cards/adapters/response"
import { db } from "@/lib/firebaseAdmin"
import { cache } from "react"

// 取得指定清單的卡片列表
export const getListCards = cache(
  async (listId: string): Promise<GetCardListResponse | null> => {
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
          createdAt:
            typeof d.createdAt?.toDate === "function"
              ? d.createdAt.toDate().toISOString()
              : null,
          createdBy: d.createdBy,
          readBy: d.readBy,
        }
      })

      return {
        cards: cardsList,
        count: cardsList.length,
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
