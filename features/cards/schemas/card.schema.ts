import { User } from "@/features/user/schemas/user.schema"

// Voting configuration for a card
export interface Vote {
  cardId: string
  voteId: string
  options: VoteOption[]
  isMultipleChoice: boolean
  maxChoices: number // Only relevant when isMultipleChoice is true
  userVoteRecord?: VoteRecord // Optional, only present if the user has voted
}

export interface VoteOption {
  voteOptionId: string
  text: string
  voteCount: number
}

// Tracks which options a user voted for
export interface VoteRecord {
  userId: string
  voteId: string
  optionIds: string[]
}

// Core card data, shared across all users
export interface Card {
  cardId: string
  title: string
  description: string
  createdAt: Date
  createdBy: User
  publishTime: Date
  endTime: Date
  eventTime: Date
  address?: string
}

// Per-user state for a card
export interface UserCardState {
  userId: string
  cardId: string
  isRead: boolean
  isVoted: boolean
}
