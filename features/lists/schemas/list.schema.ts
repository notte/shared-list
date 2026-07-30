import { UserRole } from "@/types/enums"

export interface User {
  userId: string
  userName: string
  color: string
}

export interface List {
  title: string
  createdBy: User
  createdAt: Date
  members: Record<
    string,
    { role: UserRole; userName: string; color: string; joinedAt: Date }
  >
}

export interface ListMember {
  userName: string
  color: string
  joinedAt: Date
  role: UserRole
}

export interface Invite {
  inviteCode: string
  listId: string
  title: string
  creator: string
  createdAt: Date
  expiredAt: Date | null
}
