import { NextResponse } from "next/server"
import { db } from "@/lib/firebaseAdmin"
import { FieldValue } from "firebase-admin/firestore"

export async function POST(
  request: Request,
  { params }: { params: { listId: string } },
) {
  try {
    const { listId } = params

    // 1. 使用 Node.js 內建的原生方法產生安全且隨機的 UUID 作為邀請碼
    const inviteCode = crypto.randomUUID()

    // 2. 將邀請資訊寫入根集合 `invites` 中
    // 這裡不寫入 members，因為此時還沒有使用者的真實 userId
    await db.collection("invites").doc(inviteCode).set({
      listId: listId,
      status: "pending", // 狀態：等待加入
      createdAt: FieldValue.serverTimestamp(),
      // 可以加上由誰建立、或限定此邀請碼的過期時間
    })

    // 3. 回傳邀請碼給前端，前端可以拼成網址（例如：/join?code=xxxx-xxxx...）
    return NextResponse.json({ inviteCode }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
