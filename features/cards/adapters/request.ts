import { Card, Vote } from "@/features/cards/schemas/card.schema"
import { CardType } from "@/types/enums"

type BaseCreateCardRequest = Omit<
  Card,
  | "cardId"
  | "createdAt"
  | "createdBy"
  | "readBy"
  | "vote"
  | "cardType"
  | "userName"
  | "color"
>

export interface CreateAnnounceCardRequest extends BaseCreateCardRequest {
  cardType: CardType.Announce
}

export interface CreateVoteCardRequest extends BaseCreateCardRequest {
  cardType: CardType.Vote
  vote?: Vote
}

// 編輯 & 新增卡片
export type CardRequest = CreateAnnounceCardRequest | CreateVoteCardRequest

// 投票動作
export interface SubmitVoteRequest {
  optionIds: string[]
}
