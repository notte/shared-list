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
  members: Record<string, { role: UserRole; name: string }>
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
  listId: string
  userId: string
  inviteCode: string
  createdAt: Date
  userName: string
  joinedAt: Date
}

// 邀請碼列表項目
export interface InviteCodeItem {
  listId: string
  title: string
  creator: string
  createdAt: Date
  expiredAt: null
}
