// Cards 相關 API 請求的型別定義

// 取得指定使用者的卡片狀態
export interface getCardStateRequest {
  userId: string
  cardId: string
}

// 取得指定卡片的投票資訊(包含投票選項、投票數量、使用者投票紀錄)
export interface getVoteRequest {
  userId: string
  cardId: string
}

// 取得指定投票的指定使用者投票紀錄
export interface getVoteRecordRequest {
  userId: string
  voteId: string
}
