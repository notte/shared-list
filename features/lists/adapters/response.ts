import { List, ListMember } from "@/features/lists/schemas/list.schema"
import { UserStatus } from "@/features/user/constants/user-status"

// 產生邀請連結後，後端回傳的結果
export interface CreateInviteResponse {
  inviteCode: string // 後端經由 crypto.randomUUID() 產生的邀請碼
}

// 取得目前 listId 目前所有有效的邀請碼列表
export interface GetInviteItemResponse {
  inviteCode: string
  listId: string
  createdAt: Date
  status: UserStatus
}

export interface GetListInvitesResponse {
  invites: GetInviteItemResponse[]
}

// 取得單一清單詳細資料
export interface GetListDetailResponse {
  list: List
  members: ListMember[]
}

// 新成員成功加入後，後端回傳的結果
export interface JoinListResponse {
  message: string
  listId: string // 讓前端知道加入成功後，要跳轉到哪一個 list 頁面
}
