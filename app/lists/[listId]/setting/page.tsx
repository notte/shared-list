import MemberList from "@/features/lists/components/server/MemberList"
import MemberItem, {
  MemberItemProps,
} from "@/features/lists/components/server/MemberItem"
import { getListInvites, getListMembers } from "@/services/db/list"

export default async function Page({
  params,
}: {
  params: Promise<{ listId: string }>
}) {
  const { listId } = await params

  const invites = await getListInvites(listId)
  const members = await getListMembers(listId)

  const memberList: MemberItemProps[] = [
    ...(Array.isArray(invites?.invites) ? invites?.invites : []),
    ...(Array.isArray(members?.members) ? members?.members : []),
  ].map((item) => {
    return {
      userId: "userId" in item ? item.userId : undefined,
      inviteCode: "inviteCode" in item ? item.inviteCode : undefined,
      userName: "userName" in item ? item.userName : undefined,
      status: "status" in item ? item.status : undefined,
      createdAt: "createdAt" in item ? item.createdAt : undefined,
      joinedAt: "joinedAt" in item ? item.joinedAt : undefined,
      role: "role" in item ? item.role : undefined,
      listId: listId,
    }
  })

  return (
    <MemberList listId={listId}>
      {memberList.map((member, index) => (
        <MemberItem key={`${member.listId}-${index}`} {...member} />
      ))}
    </MemberList>
  )
}
