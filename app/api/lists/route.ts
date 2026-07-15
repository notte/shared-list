import { NextResponse } from "next/server"
import { auth, db } from "@/lib/firebaseAdmin"
import { FieldValue } from "firebase-admin/firestore"
import { getAuthToken } from "@/services/http/apiUtils"
import { UserRole } from "@/features/user/constants/user-status"

// ✅ 建立新的共享清單
export async function POST(request: Request) {
  try {
    const token = await getAuthToken()

    // 透過 Firebase Admin SDK 驗證 Token，解析出真實的匿名 UID
    const decodedToken = await auth.verifyIdToken(token)
    const currentUserId = decodedToken.uid

    // 從前端 Request Body 接收完整的建立資訊
    const { title, userName, color } = await request.json()

    if (!title || !userName || !color) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 },
      )
    }

    // 自動生成 listId
    const newListRef = db.collection("lists").doc()
    const batch = db.batch()

    // 寫入 lists/{listId} 本體
    const newListData = {
      title: title,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: {
        userId: currentUserId,
        userName: userName,
        color: color,
      },
      members: {
        [currentUserId]: {
          userName: userName,
          color: color,
          role: UserRole.Admin,
        },
      },
    }
    batch.set(newListRef, newListData)

    // 同步在子集合 lists/{listId}/members/{userId} 建立成員詳細資料
    const memberSubRef = newListRef.collection("members").doc(currentUserId)
    const newMemberData = {
      userName: userName,
      color: color,
      joinedAt: FieldValue.serverTimestamp(),
      role: UserRole.Admin,
    }
    batch.set(memberSubRef, newMemberData)

    // 批量寫入
    await batch.commit()

    return NextResponse.json(
      {
        message: "List and personal information successfully created.",
        listId: newListRef.id,
      },
      { status: 201 },
    )
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// 取得目前使用者加入的所有清單 💜 暫時不實作
export async function GET(request: Request) {}
