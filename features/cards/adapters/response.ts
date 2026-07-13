import { Card } from "@/features/cards/schemas/card.schema"

export type CardSummary = Pick<
  Card,
  | "cardId"
  | "cardType"
  | "title"
  | "description"
  | "createdAt"
  | "createdBy"
  | "readBy"
>

export interface GetCardListResponse {
  cards: CardSummary[]
  count: number
}

export interface GetCardDetailResponse {
  card: Card
}
