import { User } from "@/features/user/schemas/user.schema"
import { CardType } from "@/types/enums"

// Voting configuration for a card
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

// Tracks which options a user voted for
export interface VoteRecord {
  optionIds: string[]
}

// Core card data, shared across all users
export interface Card {
  cardId: string
  cardType: CardType
  title: string
  description: string
  content: string
  createdAt: Date
  createdBy: User
  publishTime: Date
  endTime: Date
  eventTime: Date
  address?: string
  vote?: Vote
}

// Per-user state for a card
export interface UserCardState {
  isRead: boolean
}
