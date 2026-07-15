import { List } from "@/features/lists/schemas/list.schema"
import { db } from "@/lib/firebaseAdmin"

// 取得指定清單詳情
export async function getListDetail(listId: string): Promise<List | null> {
  if (!listId) return null

  const docRef = db.collection("lists").doc(listId)
  const docSnap = await docRef.get()

  if (!docSnap.exists) return null

  const data = docSnap.data()!

  return {
    ...data,
    createdAt: data.createdAt?.toDate().toISOString(),
  } as unknown as List
}
