import { NextResponse } from "next/server"
import { db } from "@/lib/firebaseAdmin"
import { FieldValue } from "firebase-admin/firestore"
import { revalidatePath } from "next/cache"

// 取得該清單下的所有成員列表 💜 暫時不實作
export async function GET(
  request: Request,
  { params }: { params: Promise<{ listId: string }> },
) {}

// ✅ 刪除成員
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ listId: string }> },
) {
  const { listId } = await params
  const { userId } = await request.json()

  // 取得清單主文件引用
  //
  const listRef = db.collection("lists").doc(listId)
  const listDoc = await listRef.get()

  if (!listDoc.exists) {
    return NextResponse.json(
      { error: "The list cannot be found." },
      { status: 404 },
    )
  }

  // 檢查子集合中該成員是否存在
  const memberRef = listRef.collection("members").doc(userId)
  const memberDoc = await memberRef.get()

  if (!memberDoc.exists) {
    return NextResponse.json(
      { error: "Member not found in this list." },
      { status: 404 },
    )
  }

  try {
    // 使用 Batch 確保兩項刪除操作同時成功或失敗
    const batch = db.batch()

    // 刪除子集合中的成員文件
    batch.delete(memberRef)

    // 將父文件中 members 欄位 (Map) 裡的該 userId 節點移除
    // 使用點符號 (dot notation) "members.userId" 指定路徑，並賦予 FieldValue.delete()
    batch.update(listRef, {
      [`members.${userId}`]: FieldValue.delete(),
    })

    // 執行批次寫入
    await batch.commit()

    revalidatePath(`/list/${listId}/setting`)

    return NextResponse.json(
      { message: "Member successfully removed from the list." },
      { status: 200 },
    )
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
