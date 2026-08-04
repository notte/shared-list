import { describe, expect, it } from "vitest"
import { voteSchema } from "@/features/cards/schemas/cardForm.schema"

const twoOptions = [
  { voteOptionId: "a", text: "Option A", voteCount: 0 },
  { voteOptionId: "b", text: "Option B", voteCount: 0 },
]

const threeOptions = [
  ...twoOptions,
  { voteOptionId: "c", text: "Option C", voteCount: 0 },
]

describe("voteSchema", () => {
  it("does not validate maxChoices when single choice", () => {
    const result = voteSchema.safeParse({
      isMultipleChoice: false,
      maxChoices: 1,
      options: twoOptions,
    })
    expect(result.success).toBe(true)

    const overMax = voteSchema.safeParse({
      isMultipleChoice: false,
      maxChoices: 99,
      options: twoOptions,
    })
    expect(overMax.success).toBe(true)
  })

  it("rejects maxChoices greater than option count for multiple choice", () => {
    const result = voteSchema.safeParse({
      isMultipleChoice: true,
      maxChoices: 4,
      options: threeOptions,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((i) => i.path.includes("maxChoices")),
      ).toBe(true)
      expect(
        result.error.issues.some((i) =>
          i.message.includes("cannot exceed the total number of options"),
        ),
      ).toBe(true)
    }
  })

  it("rejects maxChoices of 1 or less for multiple choice", () => {
    const result = voteSchema.safeParse({
      isMultipleChoice: true,
      maxChoices: 1,
      options: threeOptions,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((i) =>
          i.message.includes("must be greater than 1"),
        ),
      ).toBe(true)
    }
  })

  it("accepts valid multiple choice config", () => {
    const result = voteSchema.safeParse({
      isMultipleChoice: true,
      maxChoices: 2,
      options: threeOptions,
    })
    expect(result.success).toBe(true)
  })

  it("requires at least two options", () => {
    const result = voteSchema.safeParse({
      isMultipleChoice: false,
      maxChoices: 1,
      options: [{ voteOptionId: "a", text: "Only one", voteCount: 0 }],
    })
    expect(result.success).toBe(false)
  })
})
