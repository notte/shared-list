import { Card } from "@/features/cards/schemas/card.schema"

// 建立卡片 (通常不包含 ID 與自動產生的時間)
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

// 投票動作 (當使用者點擊投票時)
export interface SubmitVoteRequest {
  optionIds: string[] // 使用者選擇了哪些選項的 ID
}
