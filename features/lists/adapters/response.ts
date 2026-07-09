import { List, ListMember } from "@/features/lists/schemas/list.schema"

// 產生邀請連結後，後端回傳的結果
export interface CreateInviteResponse {
  inviteCode: string // 後端經由 crypto.randomUUID() 產生的邀請碼
}

// 清單已建立，透過 URL 上的 listId 呼叫

// 🌟 新增：取得單一清單詳細資料的回應 (對應 GET /api/lists/[listId])
export interface GetListDetailResponse {
  list: List
  members: ListMember[]
}

// 新成員成功加入後，後端回傳的結果
export interface JoinListResponse {
  message: string
  listId: string // 讓前端知道加入成功後，要跳轉到哪一個 list 頁面
}
