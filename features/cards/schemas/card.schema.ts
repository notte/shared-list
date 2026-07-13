import { User } from "@/features/user/schemas/user.schema"
import { CardType } from "@/types/enums"

export interface Vote {
  isMultipleChoice: boolean
  maxChoices: number
  options: VoteOption[]
}

export interface VoteOption {
  voteOptionId: string
  text: string
  voteCount: number
}

export interface VoteRecord {
  optionIds: string[]
}

export interface Card {
  cardId: string
  cardType: CardType
  title: string
  description: string
  content: string
  createdAt: Date
  createdBy: User
  publishTime: Date | null
  endTime: Date | null
  eventTime: Date | null
  readBy: string[]
  address?: string
  vote?: Vote
}
