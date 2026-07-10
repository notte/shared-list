import { NextResponse } from "next/server"
import { auth, db } from "@/lib/firebaseAdmin" // 假設您的 admin 初始化在這裡
import { FieldValue } from "firebase-admin/firestore"
import { headers } from "next/headers"

// 使用者輸入資料，建立清單
export async function POST(request: Request) {
  try {
    // 從 Request Headers 中取得 Authorization Token
    const headerList = await headers()
    const authorization = headerList.get("authorization")

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No verification token provided, access denied." },
        { status: 401 },
      )
    }

    const idToken = authorization.split("Bearer ")[1]

    // 2. 🔐 透過 Firebase Admin SDK 驗證 Token，解析出真實的匿名 UID
    const decodedToken = await auth.verifyIdToken(idToken)
    const currentUserId = decodedToken.uid // 🌟 這裡就真正拿到您的 userId 了！
    // 1. 從前端 Request Body 接收完整的建立資訊
    const { title, userName, color } = await request.json()

    if (!title || !userName || !color) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 },
      )
    }

    // 自動生成隨機 listId
    const newListRef = db.collection("lists").doc()
    const batch = db.batch()

    // 2. 寫入 lists/{listId} 本體
    const newListData = {
      title: title,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: {
        userId: currentUserId,
        userName: userName,
        color: color,
      },
      members: {
        [currentUserId]: "admin",
      },
    }
    batch.set(newListRef, newListData)

    // 3. 同步在子集合 lists/{listId}/members/{userId} 建立成員詳細資料
    const memberSubRef = newListRef.collection("members").doc(currentUserId)
    const newMemberData = {
      userName: userName,
      color: color,
      joinedAt: FieldValue.serverTimestamp(),
    }
    batch.set(memberSubRef, newMemberData)

    // 執行批量寫入
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
