import { NextResponse } from "next/server"
import { auth, db } from "@/lib/firebaseAdmin"
import { FieldValue } from "firebase-admin/firestore"
import { getAuthToken } from "@/services/http/apiUtils"

// ✅ 使用者接受邀請，正式加入該清單
export async function POST(
  request: Request,
  { params }: { params: Promise<{ inviteCode: string }> },
) {
  try {
    const { inviteCode } = await params
    const { userName, color } = await request.json()

    // 身份驗證解出真實的 UID，防範前端偽造
    const token = await getAuthToken()
    const decodedToken = await auth.verifyIdToken(token)
    const currentUserId = decodedToken.uid

    const inviteRef = db.collection("invites").doc(inviteCode)

    // 使用 Transaction 確保整套權限寫入的一致性
    await db.runTransaction(async (transaction) => {
      // 【讀取階段】必須全部放在最前面
      const inviteSnap = await transaction.get(inviteRef)

      // 無效的邀請碼
      if (!inviteSnap.exists) {
        throw new Error("Invalid invitation code.")
      }

      // 邀請碼已被使用
      const inviteData = inviteSnap.data()
      if (inviteData?.status !== "pending") {
        throw new Error("This invitation code has been used or has expired.")
      }

      const listId = inviteData.listId
      const listRef = db.collection("lists").doc(listId)
      const memberRef = listRef.collection("members").doc(currentUserId)

      // 【寫入階段】當上面的讀取與檢查全部通過，才開始執行寫入

      // 更新邀請碼狀態為已使用
      transaction.update(inviteRef, { status: "joined", usedBy: currentUserId })

      // 更新 lists/{listId} 文件內的 members 快取
      transaction.update(listRef, {
        [`members.${currentUserId}`]: {
          role: "member",
          name: userName,
        },
      })

      // 在子集合 lists/{listId}/members/{currentUserId} 建立完整的個人權限與設定檔
      transaction.set(memberRef, {
        userName,
        color,
        joinedAt: FieldValue.serverTimestamp(),
      })
    })

    return NextResponse.json(
      { message: "Successfully added to the list." },
      { status: 200 },
    )
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown Error."
    return NextResponse.json({ error: errorMessage }, { status: 400 })
  }
}
