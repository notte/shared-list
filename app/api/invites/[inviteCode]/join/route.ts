import { NextResponse } from "next/server"
import { db } from "@/lib/firebaseAdmin"
import { FieldValue } from "firebase-admin/firestore"

export async function POST(
  request: Request,
  { params }: { params: { inviteCode: string } },
) {
  try {
    const { inviteCode } = params
    const { userId, userName, color } = await request.json() // 從前端傳入匿名登入後的真實 userId

    const inviteRef = db.collection("invites").doc(inviteCode)

    // 使用 Transaction 確保整套權限寫入的一致性
    await db.runTransaction(async (transaction) => {
      const inviteSnap = await transaction.get(inviteRef)

      if (!inviteSnap.exists) {
        throw new Error("邀請碼無效")
      }

      const inviteData = inviteSnap.data()
      if (inviteData?.status !== "pending") {
        throw new Error("此邀請碼已被使用或已失效")
      }

      const listId = inviteData.listId
      const listRef = db.collection("lists").doc(listId)
      const memberRef = listRef.collection("members").doc(userId)

      // 1. 更新邀請碼狀態為已使用
      transaction.update(inviteRef, { status: "joined", usedBy: userId })

      // 2. 更新 lists/{listId} 文件內的 members map (對應結構圖：members: {userId: role})
      transaction.update(listRef, {
        [`members.${userId}`]: "member", // 賦予預設角色
      })

      // 3. 在子集合 lists/{listId}/members/{userId} 建立個人資料
      transaction.set(memberRef, {
        userName,
        color,
        joinedAt: FieldValue.serverTimestamp(),
      })
    })

    return NextResponse.json({ message: "成功加入清單" }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
