export interface FirestoreTimestampLike {
  toDate: () => Date
}

export interface SecondsTimestampLike {
  _seconds: number
}

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

export function parseToDate(value: unknown): Date | null {
  if (!value) return null

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value
  }

  if (isFirestoreTimestamp(value)) {
    return value.toDate()
  }

  if (isSecondsTimestamp(value)) {
    return new Date(value._seconds * 1000)
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value)
    return isNaN(date.getTime()) ? null : date
  }

  return null
}

export function toIsoString(value: unknown): string | null {
  const date = parseToDate(value)
  return date ? date.toISOString() : null
}

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

export function formatForDisplay(dateInput: string | Date) {
  if (!dateInput) return ""

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput

  if (isNaN(date.getTime())) return ""

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]
  const month = months[date.getMonth()]
  const day = String(date.getDate()).padStart(2, "0")
  const year = date.getFullYear()

  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"
  hours = hours % 12 || 12
  const strHours = String(hours).padStart(2, "0")

  return `${month} ${day}, ${year}, ${strHours}:${minutes} ${ampm}`
}
