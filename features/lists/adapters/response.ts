import { List, ListMember, Invite } from "@/features/lists/schemas/list.schema"

export interface CreateInviteResponse {
  inviteCode: string
}

export interface GetInviteItemResponse {
  inviteCode: string
  listId: string
  createdAt: Date
  status: Invite["status"] // "pending" | "joined"
}

export interface GetListInvitesResponse {
  invites: GetInviteItemResponse[]
}

export interface GetListDetailResponse {
  list: List
  members: ListMember[]
}

export interface JoinListResponse {
  message: string
  listId: string // 讓前端知道加入成功後，要跳轉到哪一個 list 頁面
}
