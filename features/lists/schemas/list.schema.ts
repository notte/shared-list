import { UserRole } from "@/features/user/constants/user-status"
import { User } from "@/features/user/schemas/user.schema"

// 對應根集合 `lists/{listId}`
export interface List {
  title: string
  createdBy: User
  createdAt: Date
  members: Record<string, UserRole> // 快速角色判斷快取 {userId: role}
}

// 對應子集合 `lists/{listId}/members/{userId}`
export interface ListMember {
  userName: string
  color: string
  joinedAt: Date
}

// 對應根集合 `invites/{inviteCode}`
export interface Invite {
  listId: string
  status: "pending" | "joined"
  createdAt: Date
}
