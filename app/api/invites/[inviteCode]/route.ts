import { NextResponse } from "next/server"
import { db } from "@/lib/firebaseAdmin"
import { revalidatePath } from "next/cache"

// ✅ 驗證該邀請碼是否存在、有效，並取得對應的清單資訊
export async function GET(
  request: Request,
  { params }: { params: Promise<{ inviteCode: string }> },
) {
  try {
    const { inviteCode } = await params

    // inviteCode 是文件 ID，直接用 .doc().get()
    const inviteDoc = await db.collection("invites").doc(inviteCode).get()

    // 檢查文件是否存在，防範空指標崩潰
    if (!inviteDoc.exists) {
      return NextResponse.json(
        { error: "Invitation code not found." },
        { status: 404 },
      )
    }

    const data = inviteDoc.data()

    // 檢查狀態是否有效（可選：如果不是 pending，可以決定要不要回傳 400 或依然回傳但讓前端看狀態）
    // if (data?.status !== "pending") { ... }

    // 額外拼出來前端需要的 Response 格式
    const responseData = {
      inviteCode: inviteDoc.id, // 文件 ID 就是邀請碼
      listId: data?.listId,
      createdAt: data?.createdAt ? data.createdAt.toDate() : new Date(),
      title: data?.title,
      creator: data?.creator,
      expiredAt: data?.expiredAt ?? null,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// ✅ 作廢特定的邀請碼
export async function DELETE(request: Request) {
  try {
    const { inviteCode } = await request.json()

    const inviteRef = db.collection("invites").doc(inviteCode)
    const inviteDoc = await inviteRef.get()

    // 檢查文件是否存在，防範空指標崩潰
    if (!inviteDoc.exists) {
      return NextResponse.json(
        { error: "Invitation code not found." },
        { status: 404 },
      )
    }

    const data = inviteDoc.data()
    const listId = data?.listId

    const batch = db.batch()
    batch.delete(inviteRef)
    await batch.commit()

    revalidatePath(`/list/${listId}/setting`)

    return NextResponse.json(
      {
        message: "Invite Code successfully deleted.",
        inviteCode: inviteCode,
      },
      { status: 200 },
    )
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
