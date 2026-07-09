import { Card } from "@/features/cards/schemas/card.schema"

// 建立卡片 (通常不包含 ID 與自動產生的時間)
// 提醒：由於 cardType 決定了 vote 欄位是否存在，建議保留 vote 結構
export type CreateCardRequest = Omit<Card, "cardId" | "createdAt" | "createdBy">

// 編輯卡片
export type EditCardRequest = Partial<
  Omit<Card, "cardId" | "createdAt" | "createdBy">
>

// 投票動作 (當使用者點擊投票時，發送至 /api/lists/[listId]/cards/[cardId]/vote)
export interface SubmitVoteRequest {
  optionIds: string[] // 使用者選擇了哪些選項的 ID
}
