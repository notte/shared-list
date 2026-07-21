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

    const token = await getAuthToken()
    const decodedToken = await auth.verifyIdToken(token)
    const currentUserId = decodedToken.uid

    const inviteRef = db.collection("invites").doc(inviteCode)

    let targetListId = ""

    // 使用 Transaction 確保整套權限寫入的一致性
    await db.runTransaction(async (transaction) => {
      // 1. 【讀取與驗證階段】（所有的 get 都放這裡）
      const inviteSnap = await transaction.get(inviteRef)

      if (!inviteSnap.exists) {
        throw new Error("Invalid invitation code.")
      }

      const inviteData = inviteSnap.data()
      if (!inviteData) {
        throw new Error("This invitation code has been used or has expired.")
      }

      targetListId = inviteData.listId

      const listRef = db.collection("lists").doc(targetListId)
      const memberRef = listRef.collection("members").doc(currentUserId)

      // 💡 如果未來想擴充檢查，get 必須放在下面這行（set）之前：
      // const memberSnap = await transaction.get(memberRef);
      // if (memberSnap.exists) throw new Error("You are already a member.");

      // 2. 【寫入與刪除階段】
      transaction.update(listRef, {
        [`members.${currentUserId}`]: {
          role: "member",
          name: userName,
        },
      })

      transaction.set(memberRef, {
        userName,
        color,
        joinedAt: FieldValue.serverTimestamp(),
        role: "member",
      })

      transaction.delete(inviteRef)
    })

    return NextResponse.json(
      {
        message: "Joined successfully.",
        listId: targetListId,
      },
      { status: 200 },
    )
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown Error."
    return NextResponse.json({ error: errorMessage }, { status: 400 })
  }
}
