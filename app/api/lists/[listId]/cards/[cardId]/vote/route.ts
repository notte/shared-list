import { auth, db } from "@/lib/firebaseAdmin"
import { NextResponse } from "next/server"
import { getAuthToken } from "@/services/http/apiUtils"
import { FieldValue } from "firebase-admin/firestore"
import { Vote, VoteOption } from "@/features/cards/schemas/card.schema"

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

      const cardData = cardSnap.data()
      const voteData = cardData?.vote as Vote | undefined

      if (!voteData || !voteData.options) {
        throw new Error("Vote configuration not found on this card.")
      }

      // 取得該使用者先前的投票紀錄（若無則為空陣列）
      const oldOptionIds: string[] = oldRecordSnap.exists
        ? oldRecordSnap.data()?.optionIds || []
        : []

      // 深拷貝一份現有的選項陣列，準備在記憶體中進行計票增減
      const updatedOptions = JSON.parse(
        JSON.stringify(voteData.options),
      ) as VoteOption[]

      let isChanged = false

      // 遍歷所有選項，根據新舊勾選狀態精準增減計票
      for (const option of updatedOptions) {
        const wasSelected = oldOptionIds.includes(option.voteOptionId)
        const isSelected = optionIds.includes(option.voteOptionId)

        if (wasSelected && !isSelected) {
          // 原本有勾，現在沒勾 -> 減 1
          option.voteCount = Math.max(0, option.voteCount - 1)
          isChanged = true
        } else if (!wasSelected && isSelected) {
          // 原本沒勾，現在有勾 -> 加 1
          option.voteCount = (option.voteCount || 0) + 1
          isChanged = true
        }
      }

      // 【寫入階段】

      // 1. 更新使用者的投票紀錄
      transaction.set(
        voteRecordRef,
        { optionIds, updatedAt: FieldValue.serverTimestamp() },
        { merge: true },
      )

      // 2. 如果票數有變動，才將更新後的整個 options 陣列寫回卡片文件
      if (isChanged) {
        transaction.update(cardRef, {
          "vote.options": updatedOptions,
        })
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
