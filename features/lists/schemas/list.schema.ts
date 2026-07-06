import { UserRole } from "@/features/user/constants/user-status"

export interface List {
  listId: string
  name: string
  createdBy: string
  createdAt: Date
  members: Record<string, UserRole>
}

export interface ListMember {
  listId: string
  userId: string
  userName: string
  role: UserRole
  color: string
  joinedAt: Date
}
