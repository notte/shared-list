import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  mockGetUserDataServer,
  mockCardGet,
  mockBatchDelete,
  mockBatchCommit,
  mockRevalidatePath,
  mockUpdateTag,
  mockRevalidateTag,
} = vi.hoisted(() => ({
  mockGetUserDataServer: vi.fn(),
  mockCardGet: vi.fn(),
  mockBatchDelete: vi.fn(),
  mockBatchCommit: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockUpdateTag: vi.fn(),
  mockRevalidateTag: vi.fn(),
}))

vi.mock("@/services/storage/user.server", () => ({
  getUserDataServer: mockGetUserDataServer,
}))

vi.mock("@/lib/firebase.admin", () => ({
  db: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        collection: vi.fn(() => ({
          doc: vi.fn(() => ({ get: mockCardGet })),
        })),
      })),
    })),
    batch: vi.fn(() => ({
      delete: mockBatchDelete,
      commit: mockBatchCommit,
    })),
  },
}))

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
  updateTag: mockUpdateTag,
  revalidateTag: mockRevalidateTag,
}))

import { deleteCard } from "@/features/cards/actions/deleteCard"

describe("deleteCard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserDataServer.mockResolvedValue({ userId: "creator-1" })
    mockCardGet.mockResolvedValue({
      exists: true,
      data: () => ({ createdBy: { userId: "creator-1" } }),
    })
    mockBatchCommit.mockResolvedValue(undefined)
  })

  it("rejects unauthenticated callers", async () => {
    mockGetUserDataServer.mockResolvedValue(null)

    const result = await deleteCard("list-1", "card-1")

    expect(result).toEqual({ success: false, error: "Not authenticated." })
    expect(mockCardGet).not.toHaveBeenCalled()
  })

  it("returns error when card is missing", async () => {
    mockCardGet.mockResolvedValue({ exists: false })

    const result = await deleteCard("list-1", "card-1")

    expect(result).toEqual({ success: false, error: "Card not found." })
  })

  it("rejects non-creator callers", async () => {
    mockGetUserDataServer.mockResolvedValue({ userId: "other-user" })

    const result = await deleteCard("list-1", "card-1")

    expect(result).toEqual({
      success: false,
      error: "Only the card creator can delete this card.",
    })
    expect(mockBatchCommit).not.toHaveBeenCalled()
  })

  it("deletes card when caller is creator", async () => {
    const result = await deleteCard("list-1", "card-1")

    expect(result).toEqual({ success: true, data: undefined })
    expect(mockBatchCommit).toHaveBeenCalled()
    expect(mockUpdateTag).toHaveBeenCalledWith("list-list-1-cards")
    expect(mockUpdateTag).toHaveBeenCalledWith("card-card-1")
    expect(mockRevalidateTag).toHaveBeenCalledWith("list-list-1-cards", {
      expire: 0,
    })
    expect(mockRevalidateTag).toHaveBeenCalledWith("card-card-1", {
      expire: 0,
    })
  })
})
