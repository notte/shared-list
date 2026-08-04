import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  mockGetUserDataServer,
  mockCheckIsListAdmin,
  mockListGet,
  mockMemberGet,
  mockBatchCommit,
  mockBatchDelete,
  mockBatchUpdate,
  mockRevalidatePath,
  mockUpdateTag,
  mockRevalidateTag,
} = vi.hoisted(() => ({
  mockGetUserDataServer: vi.fn(),
  mockCheckIsListAdmin: vi.fn(),
  mockListGet: vi.fn(),
  mockMemberGet: vi.fn(),
  mockBatchCommit: vi.fn(),
  mockBatchDelete: vi.fn(),
  mockBatchUpdate: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockUpdateTag: vi.fn(),
  mockRevalidateTag: vi.fn(),
}))

vi.mock("@/services/storage/user.server", () => ({
  getUserDataServer: mockGetUserDataServer,
}))

vi.mock("@/services/db/list", () => ({
  checkIsListAdmin: mockCheckIsListAdmin,
}))

vi.mock("@/lib/firebase.admin", () => ({
  db: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: mockListGet,
        collection: vi.fn(() => ({
          doc: vi.fn(() => ({ get: mockMemberGet })),
        })),
      })),
    })),
    batch: vi.fn(() => ({
      delete: mockBatchDelete,
      update: mockBatchUpdate,
      commit: mockBatchCommit,
    })),
  },
}))

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
  updateTag: mockUpdateTag,
  revalidateTag: mockRevalidateTag,
}))

vi.mock("firebase-admin/firestore", () => ({
  FieldValue: { delete: vi.fn(() => "FIELD_DELETE") },
}))

import { removeMember } from "@/features/lists/actions/removeMember"

describe("removeMember", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserDataServer.mockResolvedValue({ userId: "admin-1" })
    mockCheckIsListAdmin.mockResolvedValue(true)
    mockListGet.mockResolvedValue({ exists: true })
    mockMemberGet.mockResolvedValue({ exists: true })
    mockBatchCommit.mockResolvedValue(undefined)
  })

  it("rejects unauthenticated callers", async () => {
    mockGetUserDataServer.mockResolvedValue(null)

    const result = await removeMember("list-1", "user-2")

    expect(result).toEqual({ success: false, error: "Not authenticated." })
    expect(mockCheckIsListAdmin).not.toHaveBeenCalled()
  })

  it("rejects non-admin callers", async () => {
    mockCheckIsListAdmin.mockResolvedValue(false)

    const result = await removeMember("list-1", "user-2")

    expect(result).toEqual({
      success: false,
      error: "Only administrators can remove members.",
    })
    expect(mockBatchCommit).not.toHaveBeenCalled()
  })

  it("returns error when list is missing", async () => {
    mockListGet.mockResolvedValue({ exists: false })

    const result = await removeMember("list-1", "user-2")

    expect(result).toEqual({ success: false, error: "List not found." })
  })

  it("returns error when member is missing", async () => {
    mockMemberGet.mockResolvedValue({ exists: false })

    const result = await removeMember("list-1", "user-2")

    expect(result).toEqual({
      success: false,
      error: "Member not found in this list.",
    })
  })

  it("removes member when caller is admin", async () => {
    const result = await removeMember("list-1", "user-2")

    expect(result).toEqual({ success: true, data: undefined })
    expect(mockBatchCommit).toHaveBeenCalled()
    expect(mockUpdateTag).toHaveBeenCalledWith("list-members-list-1")
    expect(mockRevalidateTag).toHaveBeenCalledWith("list-members-list-1", {
      expire: 0,
    })
  })
})
