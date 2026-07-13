import { NextResponse } from "next/server"
import { auth, db } from "@/lib/firebaseAdmin"
import { GetCardListResponse } from "@/features/cards/adapters/response"
import { CreateCardRequest } from "@/features/cards/adapters/request"
import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { headers } from "next/headers"
import { getAuthToken } from "@/services/http/apiUtils"

// ✅ 取得某清單的卡片列表
export async function GET(
  request: Request,
  { params }: { params: Promise<{ listId: string }> },
) {
  try {
    const { listId } = await params

    const cardsSnap = await db
      .collection("lists")
      .doc(listId)
      .collection("cards")
      .get()

    const cardsList = cardsSnap.docs.map((doc) => {
      const d = doc.data()

      return {
        cardId: doc.id,
        cardType: d.cardType,
        title: d.title,
        description: d.description,
        content: d.content,
        createdAt: d.createdAt?.toDate()
          ? d.createdAt.toDate().toISOString()
          : null,
        createdBy: d.createdBy,
        publishTime: d.publishTime?.toDate()
          ? d.publishTime.toDate().toISOString()
          : null,
        endTime: d.endTime?.toDate() ? d.endTime.toDate().toISOString() : null,
        eventTime: d.eventTime?.toDate()
          ? d.eventTime.toDate().toISOString()
          : null,
        address: d.address,
        vote: d.vote,
        readBy: d.readBy,
      }
    }) as unknown as GetCardListResponse["cards"]

    const responseData: GetCardListResponse = {
      cards: cardsList,
      count: cardsList.length,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// ✅ 建立卡片
export async function POST(
  request: Request,
  { params }: { params: Promise<{ listId: string }> },
) {
  try {
    const { listId } = await params
    const token = await getAuthToken()

    // 透過 Firebase Admin SDK 驗證 Token，解析出真實的匿名 UID
    const decodedToken = await auth.verifyIdToken(token)
    const currentUserId = decodedToken.uid

    // 從 HTTP Request Body 取得前端傳過來的卡片內容
    const body: CreateCardRequest = await request.json()

    const {
      title,
      content,
      cardType,
      description,
      publishTime,
      endTime,
      eventTime,
      address,
      vote,
      userName,
      color,
    } = body

    // 這裡會自動生成卡片 id
    const newCardRef = db
      .collection("lists")
      .doc(listId)
      .collection("cards")
      .doc()
    const newCardId = newCardRef.id
    const batch = db.batch()

    const newCardData = {
      cardId: newCardId,
      title,
      content,
      cardType,
      description,
      publishTime: publishTime
        ? Timestamp.fromDate(new Date(publishTime))
        : null,
      endTime: endTime ? Timestamp.fromDate(new Date(endTime)) : null,
      eventTime: eventTime ? Timestamp.fromDate(new Date(eventTime)) : null,
      address,
      vote,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: {
        userName,
        color,
        userId: currentUserId,
      },
      readBy: [currentUserId],
    }

    // 執行批量寫入
    batch.set(newCardRef, newCardData)
    await batch.commit()
    return NextResponse.json({ message: "Card created successfully" })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
