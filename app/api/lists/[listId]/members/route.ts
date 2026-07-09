import { NextResponse } from "next/server"
import { db } from "@/lib/firebaseAdmin"

export async function POST(
  _request: Request,
  { params }: { params: { listId: string } },
) {
  try {
    const { listId } = params

    // 取得指定 listId 的文件參照
    const listRef = db.collection("lists").doc(listId)
    const docSnap = await listRef.get()

    // 檢查該列表是否存在
    if (!docSnap.exists) {
      return NextResponse.json({ error: "找不到該列表" }, { status: 404 })
    }

    // 取得文件資料
    const listData = docSnap.data()

    // 格式化輸出資料（可在此將 Firestore 的 Timestamp 轉換為 ISO 字串，方便前端處理）
    const result = {
      id: docSnap.id,
      title: listData?.title,
      createdBy: listData?.createdBy,
      members: listData?.members || {}, // 結構圖中的 members: {userId: role}
      createdAt: listData?.createdAt?.toDate
        ? listData.createdAt.toDate().toISOString()
        : null,
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
