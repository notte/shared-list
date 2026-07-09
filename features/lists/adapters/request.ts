// 管理者產生邀請連結時：通常由後端自動生成 uuid，前端可能不需要帶資料，或帶入可選設定
// 目前可為空，保留作為未來擴充使用（例如：expiresIn?: number）
// export interface CreateInviteRequest {}

export interface CreateListRequest {
  title: string // 清單名稱
  userName: string // 建立者輸入的暱稱
  color: string // 建立者選擇的代表色
}

// 受邀新成員點擊加入時：發送至 /api/invites/[inviteCode]/join 的資料
export interface JoinListRequest {
  userId: string // 前端匿名登入後取得的真實 UID
  userName: string // 使用者輸入的暱稱
  color: string // 使用者選擇的代表色
}
