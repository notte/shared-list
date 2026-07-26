import {
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

    try {
      const docRef = db.collection("lists").doc(listId)
      const docSnap = await docRef.get()

      if (!docSnap.exists) return null

      const data = docSnap.data()!

      return {
        ...data,
        createdAt:
          typeof data.createdAt?.toDate === "function"
            ? data.createdAt.toDate().toISOString()
            : null,
      } as unknown as GetListDetailResponse
    } catch (error) {
      console.error(
        `[getListDetail] Failed to fetch list detail for listId ${listId}:`,
        error,
      )
      return null
    }
  },
)

// 取得指定清單邀請碼列表
export const getListInvites = cache(
  async (listId: string): Promise<GetListInvitesResponse | null> => {
    if (!listId) return null

    try {
      const invitesSnapshot = await db
        .collection("invites")
        .where("listId", "==", listId)
        .get()

      if (invitesSnapshot.empty) {
        return { invites: [] }
      }

      const invites = invitesSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          inviteCode: doc.id,
          listId: data.listId,
          createdAt:
            typeof data.createdAt?.toDate === "function"
              ? data.createdAt.toDate().toISOString()
              : new Date().toISOString(),
          title: data.title,
          creator: data.creator,
          expiredAt:
            typeof data.expiredAt?.toDate === "function"
              ? data.expiredAt.toDate().toISOString()
              : null,
        }
      })

      return { invites }
    } catch (error) {
      console.error(
        `[getListInvites] Failed to fetch invites for listId ${listId}:`,
        error,
      )
      return null
    }
  },
)

// 取得指定清單成員列表
export const getListMembers = cache(
  async (listId: string): Promise<GetListMembersResponse | null> => {
    if (!listId) return null

    try {
      const membersRef = db
        .collection("lists")
        .doc(listId)
        .collection("members")
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
          joinedAt:
            typeof data.joinedAt?.toDate === "function"
              ? data.joinedAt.toDate().toISOString()
              : null,
          role: data.role,
        }
      })

      return { members }
    } catch (error) {
      console.error(
        `[getListMembers] Failed to fetch members for listId ${listId}:`,
        error,
      )
      return null
    }
  },
)

// 取得指定邀請碼詳情
export const getInviteCodeDetail = cache(
  async (code: string): Promise<GetInviteCodeDetailResponse | null> => {
    if (!code) return null

    try {
      const docSnap = await db.collection("invites").doc(code).get()

      if (!docSnap.exists) return null

      const inviteData = docSnap.data()
      if (!inviteData) return null

      return {
        inviteCode: docSnap.id,
        listId: inviteData.listId,
        title: inviteData.title,
        creator: inviteData.creator,
        createdAt:
          typeof inviteData.createdAt?.toDate === "function" // 驗證是否為標準的 Timestamp 型態
            ? inviteData.createdAt.toDate().toISOString()
            : new Date().toISOString(),
        expiredAt:
          typeof inviteData.expiredAt?.toDate === "function"
            ? inviteData.expiredAt.toDate().toISOString()
            : null,
      }
    } catch (error) {
      console.error(
        `[getInviteCodeDetail] Failed to fetch invite detail for code ${code}:`,
        error,
      )
      return null
    }
  },
)
