import { NextResponse } from "next/server"
import { db } from "@/lib/firebase.admin"

// ✅ 作廢特定的邀請碼
export async function DELETE(request: Request) {
  try {
    const { inviteCode } = await request.json()

    const inviteRef = db.collection("invites").doc(inviteCode)
    const inviteDoc = await inviteRef.get()

    // 檢查文件是否存在，防範空指標崩潰
    if (!inviteDoc.exists) {
      return NextResponse.json(
        { error: "Invitation code not found." },
        { status: 404 },
      )
    }

    const batch = db.batch()
    batch.delete(inviteRef)
    await batch.commit()

    return NextResponse.json(
      {
        message: "Invite Code successfully deleted.",
        inviteCode: inviteCode,
      },
      { status: 200 },
    )
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
