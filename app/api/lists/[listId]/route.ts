import { NextResponse } from "next/server"
import { db } from "@/lib/firebaseAdmin"
import { GetListDetailResponse } from "@/features/lists/adapters/response"

export async function GET(
  request: Request,
  // 將 params 宣告為 Promise 以符合新版 Next.js 規範
  { params }: { params: Promise<{ listId: string }> },
) {
  try {
    const { listId } = await params // 🌟 2. 使用 await 解構參數

    // 撈取清單主體
    const listDoc = await db.collection("lists").doc(listId).get()
    if (!listDoc.exists) {
      return NextResponse.json(
        { error: "The list cannot be found." },
        { status: 404 },
      )
    }

    const rawListData = listDoc.data()
    if (!rawListData) {
      return NextResponse.json({ error: "Data corrupted." }, { status: 500 })
    }

    // 修正序列化問題：手動將主體的 Timestamp 轉為字串
    const listData = {
      ...rawListData,
      createdAt: rawListData.createdAt?.toDate
        ? rawListData.createdAt.toDate().toISOString()
        : null,
    } as unknown as GetListDetailResponse["list"]

    // 撈取之下的 members 子集合
    const membersSnap = await db
      .collection("lists")
      .doc(listId)
      .collection("members")
      .get()

    const membersList = membersSnap.docs.map((doc) => {
      const d = doc.data()
      return {
        id: doc.id,
        userName: d.userName,
        color: d.color,
        // 將 Firestore Timestamp 轉為 ISO 字串，或為 null
        joinedAt: d.joinedAt?.toDate ? d.joinedAt.toDate().toISOString() : null,
      }
    }) as unknown as GetListDetailResponse["members"]

    // 額外拼出來前端需要的 Response 格式
    const responseData: GetListDetailResponse = {
      list: listData,
      members: membersList,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
