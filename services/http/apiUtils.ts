import { headers } from "next/headers"

export async function getAuthToken(): Promise<string> {
  const headerList = await headers()
  const authorization = headerList.get("authorization")

  if (!authorization || !authorization.startsWith("Bearer ")) {
    // 🌟 找不到 Token 就拋出明確的錯誤訊息
    throw new Error("UNAUTHORIZED")
  }

  // 🌟 成功就切出並回傳 Token 字串
  return authorization.split("Bearer ")[1]
}
