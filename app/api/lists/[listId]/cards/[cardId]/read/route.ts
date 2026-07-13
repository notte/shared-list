import { NextResponse } from "next/server"
import { auth, db } from "@/lib/firebaseAdmin"
import { getAuthToken } from "@/services/http/apiUtils"
import { FieldValue } from "firebase-admin/firestore"

// ✅ 標記卡片為已讀 (將 userId 放入 readBy 陣列)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ listId: string; cardId: string }> },
) {
  try {
    const { listId, cardId } = await params
    const token = await getAuthToken()

    // 透過 Firebase Admin SDK 驗證 Token，解析出真實的匿名 UID
    const decodedToken = await auth.verifyIdToken(token)
    const currentUserId = decodedToken.uid

    const cardDetailRef = db
      .collection("lists")
      .doc(listId)
      .collection("cards")
      .doc(cardId)

    const cardDetailDoc = await cardDetailRef.get()

    // 先檢查當前儲存卡片是否存在，不存在應回傳 404
    if (!cardDetailDoc.exists) {
      return NextResponse.json({ error: "Card not found." }, { status: 404 })
    }

    const batch = db.batch()

    // 改用 batch.update 配合 arrayUnion，安全又去重
    batch.update(cardDetailRef, {
      readBy: FieldValue.arrayUnion(currentUserId),
    })

    await batch.commit()

    return NextResponse.json(
      {
        message: "Card successfully marked as read.",
        cardId: cardDetailRef.id,
      },
      { status: 200 },
    )
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
