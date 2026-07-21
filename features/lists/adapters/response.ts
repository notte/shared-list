import { List, ListMember, Invite } from "@/features/lists/schemas/list.schema"

// 建立邀請碼
export interface CreateInviteResponse {
  inviteCode: string
}

// 邀請碼列表
export interface GetListInvitesResponse {
  invites: Invite[]
}

export type GetInviteCodeDetailResponse = Invite

export type SerializedMember = Omit<List["members"][string], "joinedAt"> & {
  joinedAt: string | null
}

// 清單詳細
export type GetListDetailResponse = Omit<List, "members"> & {
  members: Record<string, SerializedMember>
}

export interface MemberItem extends ListMember {
  userId: string
}
// 成員列表
export interface GetListMembersResponse {
  members: MemberItem[]
}

// 清單成員加入
export interface JoinListResponse {
  message: string
  listId: string
}
