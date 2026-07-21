import { Card, Vote } from "@/features/cards/schemas/card.schema"
import { CardType } from "@/types/enums"

type BaseCreateCardRequest = Omit<
  Card,
  "cardId" | "createdAt" | "createdBy" | "readBy" | "vote" | "cardType"
> & {
  userName: string
  color: string
}

type CreateAnnounceCardRequest = Omit<BaseCreateCardRequest, "vote"> & {
  cardType: CardType.Announce
}

type CreateVoteCardRequest = Omit<BaseCreateCardRequest, "vote"> & {
  cardType: CardType.Vote
  vote: Vote
}

export type CreateCardRequest =
  CreateAnnounceCardRequest | CreateVoteCardRequest

// 編輯卡片
export type EditCardRequest = Partial<
  Omit<Card, "cardId" | "createdAt" | "createdBy" | "readBy">
>

// 投票動作
export interface SubmitVoteRequest {
  optionIds: string[]
}
