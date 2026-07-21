import {
  InviteItem,
  GetListDetailResponse,
  GetListInvitesResponse,
  GetListMembersResponse,
  GetInviteCodeDetailResponse,
} from "@/features/lists/adapters/response"
import { db } from "@/lib/firebaseAdmin"
import { cache } from "react"

// 取得指定清單詳情
export const getListDetail = cache(
  async (listId: string): Promise<GetListDetailResponse | null> => {
    if (!listId) return null

    const docRef = db.collection("lists").doc(listId)
    const docSnap = await docRef.get()

    if (!docSnap.exists) return null

    const data = docSnap.data()!

    return {
      ...data,
      createdAt: data.createdAt?.toDate().toISOString(),
    } as unknown as GetListDetailResponse
  },
)

// 取得指定清單邀請碼列表
export const getListInvites = cache(
  async (listId: string): Promise<GetListInvitesResponse | null> => {
    if (!listId) return null

    const invitesSnapshot = await db
      .collection("invites")
      .where("listId", "==", listId)
      .get()

    if (invitesSnapshot.empty) {
      return { invites: [] }
    }

    const invites: InviteItem[] = invitesSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        inviteCode: doc.id,
        listId: data.listId,
        createdAt: data.createdAt?.toDate() || new Date(),
        title: data.title,
        creator: data.creator,
        expiredAt: data.expiredAt,
      }
    })

    return { invites }
  },
)

// 取得指定清單成員列表
export const getListMembers = cache(
  async (listId: string): Promise<GetListMembersResponse | null> => {
    if (!listId) return null

    const membersRef = db.collection("lists").doc(listId).collection("members")
    const snapshot = await membersRef.get()

    if (snapshot.empty) {
      return { members: [] }
    }

    const members = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        userId: doc.id,
        userName: data.userName,
        color: data.color,
        joinedAt: data.joinedAt?.toDate() || null,
        role: data.role,
      }
    })

    return { members }
  },
)

// 取得指定邀請碼詳情
export const getInviteCodeDetail = cache(
  async (code: string): Promise<GetInviteCodeDetailResponse | null> => {
    if (!code) return null

    const docSnap = await db.collection("invites").doc(code).get()

    if (!docSnap.exists) return null

    const inviteData = docSnap.data()
    if (!inviteData) return null

    return {
      inviteItem: {
        inviteCode: docSnap.id,
        listId: inviteData.listId,
        title: inviteData.title,
        creator: inviteData.creator,
        createdAt: inviteData.createdAt?.toDate() || new Date(),
        expiredAt: inviteData.expiredAt?.toDate() || null,
      },
    }
  },
)
