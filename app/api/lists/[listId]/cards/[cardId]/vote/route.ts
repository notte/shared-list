import { auth, db } from "@/lib/firebaseAdmin"
import { NextResponse } from "next/server"
import { SubmitVoteRequest } from "@/features/cards/adapters/request"
import { getAuthToken } from "@/services/http/apiUtils"
import { FieldValue } from "firebase-admin/firestore"

// ✅ 進行投票或更新投票選項 (在 voteRecords 建立紀錄並更新卡片票數)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ listId: string; cardId: string }> },
) {
  try {
    const { listId, cardId } = await params

    const token = await getAuthToken()
    const decodedToken = await auth.verifyIdToken(token)
    const currentUserId = decodedToken.uid

    const { optionIds } = (await request.json()) as { optionIds: string[] }

    // 找到指定卡片
    const cardRef = db
      .collection("lists")
      .doc(listId)
      .collection("cards")
      .doc(cardId)

    const voteRecordRef = cardRef.collection("voteRecords").doc(currentUserId)

    // 使用 Transaction 處理投票，確保多人在線同時投票時票數絕對精確
    await db.runTransaction(async (transaction) => {
      // 【讀取階段】必須全部放在最前面
      const cardSnap = await transaction.get(cardRef)
      const oldRecordSnap = await transaction.get(voteRecordRef)

      if (!cardSnap.exists) {
        throw new Error("Card not found.")
      }

      // 取得該使用者先前的投票紀錄（若無則為空陣列）
      const oldOptionIds: string[] = oldRecordSnap.exists
        ? oldRecordSnap.data()?.optionIds || []
        : []

      // 準備用來更新卡片票數的物件
      const votesUpdate: Record<string, FieldValue> = {}

      // 扣除舊選項的票數 (找出哪些選項在舊紀錄有，但新紀錄沒有)
      for (const oldId of oldOptionIds) {
        if (!optionIds.includes(oldId)) {
          // 在 Firestore 內將該選項的票數原子性減 1
          votesUpdate[`votes.${oldId}`] = FieldValue.increment(-1)
        }
      }

      // 增加新選項的票數 (找出哪些選項是新勾選的)
      for (const newId of optionIds) {
        if (!oldOptionIds.includes(newId)) {
          // 在 Firestore 內將該選項的票數原子性加 1
          votesUpdate[`votes.${newId}`] = FieldValue.increment(1)
        }
      }

      // 【寫入階段】

      // 更新使用者的投票紀錄
      transaction.set(
        voteRecordRef,
        { optionIds, updatedAt: FieldValue.serverTimestamp() },
        { merge: true },
      )

      // 如果票數有變動，才更新卡片文件頂層的 votes 統計欄位
      if (Object.keys(votesUpdate).length > 0) {
        transaction.update(cardRef, votesUpdate)
      }
    })

    return NextResponse.json(
      {
        message: "Vote successfully updated.",
      },
      { status: 200 },
    )
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// 取消投票 (刪除該使用者的 voteRecords 紀錄並扣除卡片票數) 💜 暫時不實作
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ listId: string; cardId: string }> },
) {}
