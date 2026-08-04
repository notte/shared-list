import { describe, expect, it } from "vitest"
import { parseToDate, toIsoString } from "@/lib/date"

describe("parseToDate", () => {
  it("returns null for falsy values", () => {
    expect(parseToDate(null)).toBeNull()
    expect(parseToDate(undefined)).toBeNull()
    expect(parseToDate("")).toBeNull()
    expect(parseToDate(0)).toBeNull()
    expect(parseToDate(false)).toBeNull()
  })

  it("returns the same Date instance when valid", () => {
    const date = new Date("2024-06-15T12:00:00.000Z")
    expect(parseToDate(date)).toBe(date)
  })

  it("returns null for invalid Date", () => {
    expect(parseToDate(new Date("invalid"))).toBeNull()
  })

  it("converts Firestore Timestamp-like objects via toDate", () => {
    const date = new Date("2024-01-01T00:00:00.000Z")
    const timestamp = { toDate: () => date }
    expect(parseToDate(timestamp)).toBe(date)
  })

  it("converts serialized {_seconds} timestamps", () => {
    const seconds = 1_700_000_000
    const result = parseToDate({ _seconds: seconds })
    expect(result).toEqual(new Date(seconds * 1000))
  })

  it("parses ISO date strings", () => {
    const result = parseToDate("2024-06-15T12:00:00.000Z")
    expect(result?.toISOString()).toBe("2024-06-15T12:00:00.000Z")
  })

  it("parses numeric timestamps", () => {
    const ms = Date.UTC(2024, 5, 15, 12, 0, 0)
    const result = parseToDate(ms)
    expect(result?.getTime()).toBe(ms)
  })

  it("returns null for unparseable strings", () => {
    expect(parseToDate("not-a-date")).toBeNull()
  })

  it("returns null for unsupported object shapes", () => {
    expect(parseToDate({ foo: "bar" })).toBeNull()
    expect(parseToDate([])).toBeNull()
  })
})

describe("toIsoString", () => {
  it("returns ISO string for valid inputs", () => {
    expect(toIsoString("2024-06-15T12:00:00.000Z")).toBe(
      "2024-06-15T12:00:00.000Z",
    )
    expect(toIsoString(new Date("2024-06-15T12:00:00.000Z"))).toBe(
      "2024-06-15T12:00:00.000Z",
    )
    expect(toIsoString({ _seconds: 1_700_000_000 })).toBe(
      new Date(1_700_000_000 * 1000).toISOString(),
    )
  })

  it("returns null for invalid inputs", () => {
    expect(toIsoString(null)).toBeNull()
    expect(toIsoString("not-a-date")).toBeNull()
    expect(toIsoString(new Date("invalid"))).toBeNull()
  })
})
