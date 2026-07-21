import { NextResponse } from "next/server"
import { db } from "@/lib/firebaseAdmin"
import { GetListDetailResponse } from "@/features/lists/adapters/response"

// ✅ 取得特定清單的詳細資訊
export async function GET(
  request: Request,
  { params }: { params: Promise<{ listId: string }> },
) {
  try {
    const { listId } = await params

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

    // 將頂層文件中可能帶有的成員快取解構移出，避免影響 list 資料主體
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { members: _, ...listBody } = rawListData

    const listData = {
      ...listBody,
      createdAt: rawListData.createdAt?.toDate()
        ? rawListData.createdAt.toDate().toISOString()
        : null,
    } as unknown as GetListDetailResponse

    // 撈取之下的 members 子集合
    const membersSnap = await db
      .collection("lists")
      .doc(listId)
      .collection("members")
      .get()

    const members = membersSnap.docs.reduce<GetListDetailResponse["members"]>(
      (sum, current) => {
        const d = current.data()
        sum[current.id] = {
          userName: d.userName,
          color: d.color,
          role: d.role,
          joinedAt: d.joinedAt?.toDate()
            ? d.joinedAt.toDate().toISOString()
            : null,
        }
        return sum
      },
      {} as GetListDetailResponse["members"],
    )

    // 額外拼出來前端需要的 Response 格式
    const responseData: GetListDetailResponse = {
      ...listData,
      members,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// 修改清單名稱 💜 暫時不實作
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ listId: string }> },
) {}

// 刪除該清單（及其底下的子集合資料）💜 暫時不實作
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ listId: string }> },
) {}
