import { User } from "@/features/lists/schemas/list.schema"
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
  createdAt: string
  createdBy: User
  publishTime: string
  endTime: string
  eventTime: string | null
  eventStartTime: string | null
  eventEndTime: string | null
  readBy: string[]
  address?: string
  vote?: Vote
}
