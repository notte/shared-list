// 1. 定義可相容 Client 與 Server 端 Firebase Timestamp 的輕量介面 (不依賴任何外部套件)
export interface FirestoreTimestampLike {
  toDate: () => Date
}

export interface SecondsTimestampLike {
  _seconds: number
}

// 2. Type Guards (型別守衛) - 替代 instanceof Timestamp，且無型別盲點
function isFirestoreTimestamp(value: unknown): value is FirestoreTimestampLike {
  return (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as FirestoreTimestampLike).toDate === "function"
  )
}

function isSecondsTimestamp(value: unknown): value is SecondsTimestampLike {
  return (
    typeof value === "object" &&
    value !== null &&
    "_seconds" in value &&
    typeof (value as SecondsTimestampLike)._seconds === "number"
  )
}

// ==========================================
// 匯出函式
// ==========================================

// 轉成 Date 物件 (前後端通用，不含 any)
export function parseToDate(value: unknown): Date | null {
  if (!value) return null

  // 原生 Date
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value
  }

  // Firebase Timestamp (帶有 toDate 方法)
  if (isFirestoreTimestamp(value)) {
    return value.toDate()
  }

  // Firebase Timestamp 物件結構 (帶有 _seconds)
  if (isSecondsTimestamp(value)) {
    return new Date(value._seconds * 1000)
  }

  // 字串或數字 (例如 ISO 字串 "2026-07-28T16:00:00.000Z" 或 Timestamp 毫秒值)
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value)
    return isNaN(date.getTime()) ? null : date
  }

  return null
}

// GET 時轉 ISO 字串 (前後端通用)
export function toIsoString(value: unknown): string | null {
  const date = parseToDate(value)
  return date ? date.toISOString() : null
}

// Input 欄位專用格式：2026/07/15 21:30
export function formatForInput(value: unknown): string {
  const date = parseToDate(value)
  if (!date) return ""

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${year}/${month}/${day} ${hours}:${minutes}`
}

// 純文字顯示專用格式：Jul 28, 2026, 01:53 PM
export function formatForDisplay(value: unknown): string {
  const date = parseToDate(value)
  if (!date) return ""

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date)
}
