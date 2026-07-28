import { Card } from "@/features/cards/schemas/card.schema"

export type SerializedCardSummary = Pick<
  Card,
  | "cardId"
  | "cardType"
  | "title"
  | "description"
  | "createdBy"
  | "readBy"
  | "createdAt"
  | "publishTime"
  | "endTime"
> & {
  createdAt: string | null
}

export interface GetCardListResponse {
  cards: SerializedCardSummary[]
  count: number
}

export type GetCardDetailResponse = Card
