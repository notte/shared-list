import { UserRole } from "@/types/enums"

// 使用者基本資訊
export interface User {
  userId: string
  userName: string
  color: string
}

// 清單詳細
export interface List {
  title: string
  createdBy: User
  createdAt: Date
  members: Record<
    string,
    { role: UserRole; userName: string; color: string; joinedAt: Date }
  >
}

// 清單成員
export interface ListMember {
  userName: string
  color: string
  joinedAt: Date
  role: UserRole
}

// 設定頁面，邀請 & 成員列表
export interface Invite {
  inviteCode: string
  listId: string
  title: string
  creator: string
  createdAt: Date
  expiredAt: Date | null
}

export interface Member {
  listId: string
  userId: string
  userName: string
  joinedAt: Date
  color: string
  role: UserRole
}
