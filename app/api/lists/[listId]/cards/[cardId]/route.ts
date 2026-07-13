import { NextResponse } from "next/server"
import { db } from "@/lib/firebaseAdmin"
import { GetCardDetailResponse } from "@/features/cards/adapters/response"

// ✅ 取得單一卡片的詳細資訊
export async function GET(
  request: Request,
  { params }: { params: Promise<{ listId: string; cardId: string }> },
) {
  try {
    const { listId, cardId } = await params

    const cardDetailDoc = await db
      .collection("lists")
      .doc(listId)
      .collection("cards")
      .doc(cardId)
      .get()

    // 先檢查文件是否存在，不存在應回傳 404
    if (!cardDetailDoc.exists) {
      return NextResponse.json({ error: "Card not found." }, { status: 404 })
    }

    const rawCardData = cardDetailDoc.data()

    if (!rawCardData) {
      return NextResponse.json({ error: "Data corrupted." }, { status: 500 })
    }

    const { ...cardBody } = rawCardData

    const cardData = {
      cardId: cardBody.cardId,
      cardType: cardBody.cardType,
      title: cardBody.title,
      description: cardBody.description,
      content: cardBody.content,
      createdAt: cardBody.createdAt,
      createdBy: cardBody.createdBy,
      publishTime: cardBody.publishTime,
      endTime: cardBody.endTime,
      eventTime: cardBody.eventTime,
      readBy: cardBody.readBy,
      address: cardBody.address,
      vote: cardBody.vote,
    } as unknown as GetCardDetailResponse["card"]

    const responseData: GetCardDetailResponse = {
      card: cardData,
    }
    return NextResponse.json(responseData)
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// ✅ 更新卡片內容
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ listId: string; cardId: string }> },
) {
  try {
    const { listId, cardId } = await params

    const {
      cardType,
      title,
      description,
      content,
      publishTime,
      endTime,
      eventTime,
      readBy,
      address,
      vote,
    } = await request.json()

    const cardDetailRef = db
      .collection("lists")
      .doc(listId)
      .collection("cards")
      .doc(cardId)

    const cardDetailDoc = await cardDetailRef.get()

    // 先檢查當前儲存卡片是否存在，不存在應回傳 404
    if (!cardDetailDoc.exists) {
      return NextResponse.json({ error: "Card not found." }, { status: 404 })
    }

    const batch = db.batch()

    const updatedCardData = {
      cardType,
      title,
      description,
      content,
      publishTime,
      endTime,
      eventTime,
      readBy,
      address,
      vote,
    }

    // 使用 { merge: true } 可以確保只更新有傳入的欄位，其餘欄位（如 createdAt）維持原樣
    batch.set(cardDetailRef, updatedCardData, { merge: true })
    await batch.commit()

    return NextResponse.json(
      {
        message: "Card successfully updated.",
        cardId: cardDetailRef.id,
      },
      { status: 200 },
    )
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// ✅ 刪除該張卡片
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ listId: string; cardId: string }> },
) {
  try {
    const { listId, cardId } = await params

    // 取得該卡片的 Firestore 參照
    const cardRef = db
      .collection("lists")
      .doc(listId)
      .collection("cards")
      .doc(cardId)

    // 檢查卡片是否存在
    const cardDoc = await cardRef.get()

    if (!cardDoc.exists) {
      return NextResponse.json({ error: "Card not found." }, { status: 404 })
    }

    // 建立 Batch 批次操作並執行刪除
    const batch = db.batch()
    batch.delete(cardRef)
    await batch.commit()

    // 回傳成功訊息
    return NextResponse.json(
      {
        message: "Card successfully deleted.",
        cardId: cardId,
      },
      { status: 200 },
    )
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
