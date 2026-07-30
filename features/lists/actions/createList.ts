"use server"
import { auth, db } from "@/lib/firebase.admin"
import { FieldValue } from "firebase-admin/firestore"
import { UserRole } from "@/types/enums"

export async function createList(
  idToken: string,
  title: string,
  userName: string,
  color: string,
): Promise<string> {
  const decodedToken = await auth.verifyIdToken(idToken)
  const currentUserId = decodedToken.uid

  const newListRef = db.collection("lists").doc()
  const batch = db.batch()

  // 寫入 lists/{listId} 本體
  const newListData = {
    title: title,
    createdAt: FieldValue.serverTimestamp(),
    createdBy: {
      userId: currentUserId,
      userName: userName,
      color: color,
    },
    members: {
      [currentUserId]: {
        userName: userName,
        color: color,
        role: UserRole.Admin,
      },
    },
  }

  batch.set(newListRef, newListData)

  // 同步在子集合 lists/{listId}/members/{userId} 建立成員詳細資料
  const memberSubRef = newListRef.collection("members").doc(currentUserId)
  const newMemberData = {
    userName: userName,
    color: color,
    joinedAt: FieldValue.serverTimestamp(),
    role: UserRole.Admin,
  }
  batch.set(memberSubRef, newMemberData)

  await batch.commit()
  return newListRef.id
}
