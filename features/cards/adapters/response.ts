import { Card, Vote, VoteRecord } from "@/features/cards/schemas/card.schema"

// 卡片列表回應
export interface GetCardListResponse {
  cards: Card[]
  count: number
}

// 卡片詳情回應 (進入卡片時，通常會合併回傳該卡片主體與當前使用者的已讀狀態)
export interface GetCardDetailResponse {
  card: Card
}

// 取得投票資訊與個人投票紀錄的回應 (發送至 /api/lists/[listId]/cards/[cardId]/vote)
export interface GetVoteStatusResponse {
  vote: Vote // 包含各選項當前的總票數
  userVoteRecord: VoteRecord | null // 當前使用者投了哪些項目的紀錄（若未投則為 null）
}
