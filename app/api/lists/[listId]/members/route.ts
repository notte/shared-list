import { NextResponse } from "next/server"
import { db } from "@/lib/firebaseAdmin"

// 取得該清單下的所有成員列表 💜 暫時不實作
export async function GET(
  request: Request,
  { params }: { params: Promise<{ listId: string }> },
) {}
