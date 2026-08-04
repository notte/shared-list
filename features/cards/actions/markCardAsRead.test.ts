import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  mockGetUserDataServer,
  mockCardGet,
  mockCardUpdate,
  mockRevalidatePath,
  mockUpdateTag,
  mockRevalidateTag,
} = vi.hoisted(() => ({
  mockGetUserDataServer: vi.fn(),
  mockCardGet: vi.fn(),
  mockCardUpdate: vi.fn(),
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
          doc: vi.fn(() => ({
            get: mockCardGet,
            update: mockCardUpdate,
          })),
        })),
      })),
    })),
  },
}))

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
  updateTag: mockUpdateTag,
  revalidateTag: mockRevalidateTag,
}))

vi.mock("firebase-admin/firestore", () => ({
  FieldValue: {
    arrayUnion: vi.fn((...args: string[]) => ({ arrayUnion: args })),
  },
}))

import { markCardAsRead } from "@/features/cards/actions/markCardAsRead"

describe("markCardAsRead", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserDataServer.mockResolvedValue({ userId: "user-1" })
    mockCardGet.mockResolvedValue({ exists: true })
    mockCardUpdate.mockResolvedValue(undefined)
  })

  it("rejects unauthenticated callers", async () => {
    mockGetUserDataServer.mockResolvedValue(null)

    const result = await markCardAsRead("list-1", "card-1")

    expect(result).toEqual({ success: false, error: "Not authenticated." })
    expect(mockCardGet).not.toHaveBeenCalled()
  })

  it("returns error when card is missing", async () => {
    mockCardGet.mockResolvedValue({ exists: false })

    const result = await markCardAsRead("list-1", "card-1")

    expect(result).toEqual({ success: false, error: "Card not found." })
    expect(mockCardUpdate).not.toHaveBeenCalled()
  })

  it("marks as read and invalidates card cache tags", async () => {
    const result = await markCardAsRead("list-1", "card-1")

    expect(result).toEqual({ success: true, data: undefined })
    expect(mockCardUpdate).toHaveBeenCalled()
    expect(mockRevalidatePath).toHaveBeenCalledWith(
      "/lists/list-1/cards/card-1",
    )
    expect(mockUpdateTag).toHaveBeenCalledWith("card-card-1")
    expect(mockRevalidateTag).toHaveBeenCalledWith("card-card-1", {
      expire: 0,
    })
  })
})
