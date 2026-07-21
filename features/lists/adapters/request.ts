// 建立清單
export interface CreateListRequest {
  title: string
  userName: string
  color: string
}

// 成員通過邀請連結加入清單
export interface JoinListRequest {
  userName: string
  color: string
}
