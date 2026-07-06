import { Card, UserCardState, Vote } from "@/features/cards/schemas/card.schema"

// Cards 相關 API 回應的型別定義
export type CardItem = Partial<Card>

export interface getCardListResponse {
  cards: CardItem[]
  count: number
}

export interface getCardDetailResponse extends Partial<Card> {
  userCardState?: UserCardState
}

export type getVoteResponse = Partial<Vote>
