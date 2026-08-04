import { describe, expect, it } from "vitest"
import { getContrastColor } from "@/lib/theme"

describe("getContrastColor", () => {
  it("returns dark text for light backgrounds", () => {
    expect(getContrastColor("#ffffff")).toBe("#3a332b")
    expect(getContrastColor("#e3d9c6")).toBe("#3a332b")
    expect(getContrastColor("#dfad34")).toBe("#3a332b")
  })

  it("returns light text for dark backgrounds", () => {
    expect(getContrastColor("#000000")).toBe("#e3d9c6")
    expect(getContrastColor("#c84b31")).toBe("#e3d9c6")
    expect(getContrastColor("#2b5c8f")).toBe("#e3d9c6")
  })

  it("uses brightness threshold around mid gray", () => {
    expect(getContrastColor("#808080")).toBe("#e3d9c6")
    expect(getContrastColor("#818181")).toBe("#3a332b")
  })
})
