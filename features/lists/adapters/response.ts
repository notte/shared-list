import { List, ListMember, Invite } from "@/features/lists/schemas/list.schema"

export interface CreateInviteResponse {
  inviteCode: string
}

export interface GetListInvitesResponse {
  invites: Invite[]
}

export type GetInviteCodeDetailResponse = Invite

export type SerializedMember = Omit<List["members"][string], "joinedAt"> & {
  joinedAt: string | null
}

export type GetListDetailResponse = Omit<List, "members"> & {
  members: Record<string, SerializedMember>
}

export interface MemberResponseItem extends ListMember {
  userId: string
}
export interface GetListMembersResponse {
  members: MemberResponseItem[]
}

export interface JoinListResponse {
  message: string
  listId: string
}

export type CreateListResponse = JoinListResponse
