import { UserRole } from "@/features/user/constants/user-status"
import { User } from "@/features/user/schemas/user.schema"

export interface List {
  title: string
  createdBy: User
  createdAt: Date
  members: Record<string, { role: UserRole; name: string }> // 快取 {userId: {role, name}}
}

export interface ListMember {
  userName: string
  color: string
  joinedAt: Date
  role: UserRole
}

export interface Invite {
  listId: string
  status: "pending" | "joined"
  createdAt: Date
  expiredAt: Date | null
}
