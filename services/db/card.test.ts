import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>()
  return {
    ...actual,
    cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
  }
})

vi.mock("next/cache", () => ({
  unstable_cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}))

const { mockGet } = vi.hoisted(() => ({
  mockGet: vi.fn(),
}))

vi.mock("@/lib/firebase.admin", () => ({
  db: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        collection: vi.fn(() => ({
          get: mockGet,
        })),
      })),
    })),
  },
}))

import { getListCards } from "@/services/db/card"

function makeCardDoc(
  id: string,
  data: {
    createdByUserId: string
    publishTime: string
    endTime: string
  },
) {
  return {
    id,
    data: () => ({
      cardType: "announce",
      title: id,
      description: "desc",
      createdAt: "2024-01-01T00:00:00.000Z",
      publishTime: data.publishTime,
      endTime: data.endTime,
      createdBy: { userId: data.createdByUserId, userName: "User" },
      readBy: [],
    }),
  }
}

describe("getListCards visibility filter", () => {
  const viewerId = "viewer-1"
  const otherId = "other-1"

  const past = "2024-06-01T00:00:00.000Z"
  const future = "2024-07-01T00:00:00.000Z"
  const farFuture = "2024-08-01T00:00:00.000Z"

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2024-06-15T12:00:00.000Z"))
  })

  it("always shows cards created by the viewer", async () => {
    mockGet.mockResolvedValue({
      docs: [
        makeCardDoc("mine-draft", {
          createdByUserId: viewerId,
          publishTime: future,
          endTime: farFuture,
        }),
        makeCardDoc("mine-ended", {
          createdByUserId: viewerId,
          publishTime: past,
          endTime: past,
        }),
      ],
    })

    const result = await getListCards("list-1", viewerId)
    expect(result?.cards.map((c) => c.cardId).sort()).toEqual([
      "mine-draft",
      "mine-ended",
    ])
    expect(result?.count).toBe(2)
  })

  it("shows non-creator cards only when published and not ended", async () => {
    mockGet.mockResolvedValue({
      docs: [
        makeCardDoc("live", {
          createdByUserId: otherId,
          publishTime: past,
          endTime: future,
        }),
        makeCardDoc("not-yet", {
          createdByUserId: otherId,
          publishTime: future,
          endTime: farFuture,
        }),
        makeCardDoc("ended", {
          createdByUserId: otherId,
          publishTime: past,
          endTime: past,
        }),
      ],
    })

    const result = await getListCards("list-1", viewerId)
    expect(result?.cards.map((c) => c.cardId)).toEqual(["live"])
    expect(result?.count).toBe(1)
  })

  it("filters per userId so different viewers get different sets", async () => {
    mockGet.mockResolvedValue({
      docs: [
        makeCardDoc("alice-draft", {
          createdByUserId: "alice",
          publishTime: future,
          endTime: farFuture,
        }),
        makeCardDoc("public-live", {
          createdByUserId: "bob",
          publishTime: past,
          endTime: future,
        }),
      ],
    })

    const asAlice = await getListCards("list-1", "alice")
    const asCharlie = await getListCards("list-1", "charlie")

    expect(asAlice?.cards.map((c) => c.cardId).sort()).toEqual([
      "alice-draft",
      "public-live",
    ])
    expect(asCharlie?.cards.map((c) => c.cardId)).toEqual(["public-live"])
  })

  it("returns null when listId is empty", async () => {
    expect(await getListCards("", viewerId)).toBeNull()
    expect(mockGet).not.toHaveBeenCalled()
  })
})
