import { NextResponse } from "next/server"
import { auth, db } from "@/lib/firebaseAdmin"
import { FieldValue } from "firebase-admin/firestore"
import { getAuthToken } from "@/services/http/apiUtils"
import { GetListInvitesResponse } from "@/features/lists/adapters/response"
import { revalidatePath } from "next/cache"

// ✅ 取得該清單目前所有有效的邀請碼列表
export async function GET(
  request: Request,
  { params }: { params: Promise<{ listId: string }> },
) {
  try {
    const { listId } = await params

    // 查詢 listId 相符的所有邀請碼
    const invitesSnapshot = await db
      .collection("invites")
      .where("listId", "==", listId)
      .get()

    // 透過 loops 拿取資料
    const invites = invitesSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        inviteCode: doc.id,
        listId: data.listId,
        title: data.title,
        creator: data.creator,
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        expiredAt: data.expiredAt ?? null,
      }
    })

    // 額外拼出來前端需要的 Response 格式
    const responseData: GetListInvitesResponse = {
      invites: invites,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// ✅ 為該清單建立一組新的邀請碼
export async function POST(
  request: Request,
  { params }: { params: Promise<{ listId: string }> },
) {
  try {
    const { listId } = await params

    // 身份驗證解出真實的 UID
    const token = await getAuthToken()
    const decodedToken = await auth.verifyIdToken(token)
    const currentUserId = decodedToken.uid

    // 權限檢查（至頂層清單檢查該使用者是否為 Admin）
    const listRef = db.collection("lists").doc(listId)
    const listDoc = await listRef.get()

    if (!listDoc.exists) {
      return NextResponse.json({ error: "List not found." }, { status: 404 })
    }

    const listData = listDoc.data()
    const isCreator = listData?.createdBy.userId === currentUserId
    // const memberInfo = listData?.members?.[currentUserId] 未來可能多個 admin 情況

    // 核心：如果不是建立者，直接回傳 403 拒絕存取
    if (!isCreator) {
      return NextResponse.json(
        { error: "Forbidden: Only administrators can generate invite codes." },
        { status: 403 },
      )
    }

    // 使用 Node.js 內建的原生方法產生安全且隨機的 UUID 作為邀請碼
    const inviteCode = crypto.randomUUID()

    // 對齊完整樹狀結構欄位
    await db.collection("invites").doc(inviteCode).set({
      listId: listId,
      title: listData?.title,
      creator: listData?.createdBy.userName,
      createdAt: FieldValue.serverTimestamp(),
      expiredAt: null, // 先預設永不過期，作廢時直接由管理員下 DELETE 即可
    })

    revalidatePath(`/list/${listId}/setting`)

    // 回傳邀請碼給前端
    return NextResponse.json({ inviteCode }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
