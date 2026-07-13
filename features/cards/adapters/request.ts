import { Card } from "@/features/cards/schemas/card.schema"

// 建立卡片
export interface CreateCardRequest extends Omit<
  Card,
  "cardId" | "createdAt" | "createdBy"
> {
  userName: string
  color: string
}

// 編輯卡片
export type EditCardRequest = Partial<
  Omit<Card, "cardId" | "createdAt" | "createdBy">
>

// 投票動作
export interface SubmitVoteRequest {
  optionIds: string[]
}
