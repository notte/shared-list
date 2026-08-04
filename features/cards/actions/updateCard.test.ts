import { beforeEach, describe, expect, it, vi } from "vitest"
import { CardType } from "@/types/enums"
import type { CardRequest } from "@/features/cards/adapters/request"

const {
  mockGetUserDataServer,
  mockCardGet,
  mockCardSet,
  mockRevalidatePath,
  mockUpdateTag,
  mockRevalidateTag,
} = vi.hoisted(() => ({
  mockGetUserDataServer: vi.fn(),
  mockCardGet: vi.fn(),
  mockCardSet: vi.fn(),
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
            set: mockCardSet,
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
  Timestamp: {
    fromDate: (date: Date) => ({ _seconds: Math.floor(date.getTime() / 1000) }),
  },
}))

import { updateCard } from "@/features/cards/actions/updateCard"

const baseRequest: CardRequest = {
  cardType: CardType.Announce,
  title: "Title",
  description: "Desc",
  content: "Content",
  publishTime: "2024-06-15T12:00:00.000Z",
  endTime: "2024-07-15T12:00:00.000Z",
  eventTime: "2024-06-20T12:00:00.000Z",
  eventStartTime: null,
  eventEndTime: null,
  address: "",
}

describe("updateCard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserDataServer.mockResolvedValue({ userId: "creator-1" })
    mockCardGet.mockResolvedValue({
      exists: true,
      data: () => ({ createdBy: { userId: "creator-1" } }),
    })
    mockCardSet.mockResolvedValue(undefined)
  })

  it("rejects unauthenticated callers", async () => {
    mockGetUserDataServer.mockResolvedValue(null)

    const result = await updateCard("list-1", "card-1", baseRequest)

    expect(result).toEqual({ success: false, error: "Not authenticated." })
    expect(mockCardGet).not.toHaveBeenCalled()
  })

  it("returns error when card is missing", async () => {
    mockCardGet.mockResolvedValue({ exists: false })

    const result = await updateCard("list-1", "card-1", baseRequest)

    expect(result).toEqual({ success: false, error: "Card not found." })
  })

  it("rejects non-creator callers", async () => {
    mockGetUserDataServer.mockResolvedValue({ userId: "other-user" })

    const result = await updateCard("list-1", "card-1", baseRequest)

    expect(result).toEqual({
      success: false,
      error: "Only the card creator can edit this card.",
    })
    expect(mockCardSet).not.toHaveBeenCalled()
  })

  it("updates card when caller is creator", async () => {
    const result = await updateCard("list-1", "card-1", baseRequest)

    expect(result).toEqual({ success: true, data: undefined })
    expect(mockCardSet).toHaveBeenCalled()
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
