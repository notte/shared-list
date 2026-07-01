import { ListType } from "@/features/cards/constants/card-status"
import { User } from "@/features/user/schemas/user.schema"

// Voting configuration for a card
export interface Vote {
  cardId: string
  voteId: string
  options: VoteOption[]
  isMultipleChoice: boolean
  maxChoices: number // Only relevant when isMultipleChoice is true
  totalVotes: number
}

export interface VoteOption {
  voteOptionId: string
  text: string
  voteCount: number
}

// Tracks which options a user voted for
export interface VoteRecord {
  user: User
  voteId: string
  optionIds: string[]
}

// Ordered or unordered list attached to a card
export interface List {
  listType: ListType
  items: ListItem[]
}

export interface ListItem {
  text: string
  order: number
}

// Core card data, shared across all users
export interface CardItem {
  cardId: string
  title: string
  description: string
  createdAt: Date
  createdBy: User
  address: string
  publishTime: Date
  endTime: Date
  eventTime: Date
}

// Per-user state for a card
export interface UserCardState {
  user: User
  cardId: string
  isRead: boolean
  isVoted: boolean
}
