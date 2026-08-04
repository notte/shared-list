import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  mockVerifyIdToken,
  mockRunTransaction,
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
    mockVerifyIdToken: vi.fn(),
    mockRunTransaction: vi.fn(),
    mockUpdateTag: vi.fn(),
    mockRevalidateTag: vi.fn(),
    makeDocRef,
  }
})

vi.mock("@/lib/firebase.admin", () => ({
  auth: { verifyIdToken: mockVerifyIdToken },
  db: {
    collection: vi.fn((name: string) => ({
      doc: vi.fn((id: string) => makeDocRef(`${name}/${id}`)),
    })),
    runTransaction: mockRunTransaction,
  },
}))

vi.mock("next/cache", () => ({
  updateTag: mockUpdateTag,
  revalidateTag: mockRevalidateTag,
}))

vi.mock("firebase-admin/firestore", () => ({
  FieldValue: { serverTimestamp: vi.fn(() => "SERVER_TIMESTAMP") },
}))

import { joinList } from "@/features/lists/actions/joinList"

describe("joinList", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockVerifyIdToken.mockResolvedValue({ uid: "user-1" })
  })

  it("returns transaction failure when invite is invalid", async () => {
    mockRunTransaction.mockImplementation(async (fn) => {
      const transaction = {
        get: vi.fn().mockResolvedValue({ exists: false }),
        update: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
      }
      return fn(transaction)
    })

    const result = await joinList("token", "bad-code", "Alice", "#c84b31")

    expect(result).toEqual({
      success: false,
      error: "Invalid invitation code.",
    })
    expect(mockUpdateTag).not.toHaveBeenCalled()
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })

  it("returns transaction failure when already a member", async () => {
    mockRunTransaction.mockImplementation(async (fn) => {
      const transaction = {
        get: vi
          .fn()
          .mockResolvedValueOnce({
            exists: true,
            data: () => ({ listId: "list-1" }),
          })
          .mockResolvedValueOnce({ exists: true }),
        update: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
      }
      return fn(transaction)
    })

    const result = await joinList("token", "code-1", "Alice", "#c84b31")

    expect(result).toEqual({
      success: false,
      error: "You are already a member.",
    })
    expect(mockUpdateTag).not.toHaveBeenCalled()
  })

  it("returns listId and revalidates on success", async () => {
    mockRunTransaction.mockImplementation(async (fn) => {
      const transaction = {
        get: vi
          .fn()
          .mockResolvedValueOnce({
            exists: true,
            data: () => ({ listId: "list-1" }),
          })
          .mockResolvedValueOnce({ exists: false }),
        update: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
      }
      return fn(transaction)
    })

    const result = await joinList("token", "code-1", "Alice", "#c84b31")

    expect(result).toEqual({ success: true, data: "list-1" })
    expect(mockUpdateTag).toHaveBeenCalledWith("list-members-list-1")
    expect(mockUpdateTag).toHaveBeenCalledWith("invite-code-1")
    expect(mockRevalidateTag).toHaveBeenCalled()
  })
})
