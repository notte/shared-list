import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  mockGetUserDataServer,
  mockRunTransaction,
  mockRevalidatePath,
  mockUpdateTag,
  mockRevalidateTag,
  makeDocRef,
} = vi.hoisted(() => {
  function makeDocRef(path: string): {
    path: string
    collection: ReturnType<typeof vi.fn>
  } {
    return {
      path,
      collection: vi.fn((name: string) => ({
        doc: vi.fn((id: string) => makeDocRef(`${path}/${name}/${id}`)),
      })),
    }
  }
  return {
    mockGetUserDataServer: vi.fn(),
    mockRunTransaction: vi.fn(),
    mockRevalidatePath: vi.fn(),
    mockUpdateTag: vi.fn(),
    mockRevalidateTag: vi.fn(),
    makeDocRef,
  }
})

vi.mock("@/services/storage/user.server", () => ({
  getUserDataServer: mockGetUserDataServer,
}))

vi.mock("@/lib/firebase.admin", () => ({
  db: {
    collection: vi.fn((name: string) => ({
      doc: vi.fn((id: string) => makeDocRef(`${name}/${id}`)),
    })),
    runTransaction: mockRunTransaction,
  },
}))

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
  updateTag: mockUpdateTag,
  revalidateTag: mockRevalidateTag,
}))

vi.mock("firebase-admin/firestore", () => ({
  FieldValue: { serverTimestamp: vi.fn(() => "SERVER_TIMESTAMP") },
}))

import { submitVote } from "@/features/cards/actions/submitVote"

describe("submitVote", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserDataServer.mockResolvedValue({ userId: "user-1" })
  })

  it("returns not authenticated when no user", async () => {
    mockGetUserDataServer.mockResolvedValue(null)

    const result = await submitVote("list-1", "card-1", ["opt-a"])

    expect(result).toEqual({ success: false, error: "Not authenticated." })
    expect(mockRunTransaction).not.toHaveBeenCalled()
  })

  it("surfaces transaction failure when card is missing", async () => {
    mockRunTransaction.mockImplementation(async (fn) => {
      const transaction = {
        get: vi
          .fn()
          .mockResolvedValueOnce({ exists: false })
          .mockResolvedValueOnce({ exists: false }),
        set: vi.fn(),
        update: vi.fn(),
      }
      return fn(transaction)
    })

    const result = await submitVote("list-1", "card-1", ["opt-a"])

    expect(result).toEqual({ success: false, error: "Card not found." })
    expect(mockRevalidatePath).not.toHaveBeenCalled()
    expect(mockUpdateTag).not.toHaveBeenCalled()
  })

  it("surfaces transaction failure when vote config is missing", async () => {
    mockRunTransaction.mockImplementation(async (fn) => {
      const transaction = {
        get: vi
          .fn()
          .mockResolvedValueOnce({
            exists: true,
            data: () => ({ title: "No vote" }),
          })
          .mockResolvedValueOnce({ exists: false }),
        set: vi.fn(),
        update: vi.fn(),
      }
      return fn(transaction)
    })

    const result = await submitVote("list-1", "card-1", ["opt-a"])

    expect(result).toEqual({
      success: false,
      error: "Vote configuration not found on this card.",
    })
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it("returns success and revalidates when vote is recorded", async () => {
    mockRunTransaction.mockImplementation(async (fn) => {
      const transaction = {
        get: vi
          .fn()
          .mockResolvedValueOnce({
            exists: true,
            data: () => ({
              vote: {
                isMultipleChoice: false,
                maxChoices: 1,
                options: [
                  { voteOptionId: "opt-a", text: "A", voteCount: 0 },
                  { voteOptionId: "opt-b", text: "B", voteCount: 0 },
                ],
              },
            }),
          })
          .mockResolvedValueOnce({ exists: false }),
        set: vi.fn(),
        update: vi.fn(),
      }
      return fn(transaction)
    })

    const result = await submitVote("list-1", "card-1", ["opt-a"])

    expect(result).toEqual({ success: true, data: undefined })
    expect(mockRevalidatePath).toHaveBeenCalledWith(
      "/lists/list-1/cards/card-1",
    )
    expect(mockUpdateTag).toHaveBeenCalledWith("card-card-1")
    expect(mockRevalidateTag).toHaveBeenCalledWith("card-card-1", {
      expire: 0,
    })
  })
})
