import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  mockGetUserDataServer,
  mockCheckIsListAdmin,
  mockInviteGet,
  mockInviteDelete,
  mockRevalidatePath,
  mockUpdateTag,
  mockRevalidateTag,
} = vi.hoisted(() => ({
  mockGetUserDataServer: vi.fn(),
  mockCheckIsListAdmin: vi.fn(),
  mockInviteGet: vi.fn(),
  mockInviteDelete: vi.fn(),
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
        get: mockInviteGet,
        delete: mockInviteDelete,
      })),
    })),
  },
}))

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
  updateTag: mockUpdateTag,
  revalidateTag: mockRevalidateTag,
}))

import { deleteInvite } from "@/features/lists/actions/deleteInvite"

describe("deleteInvite", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserDataServer.mockResolvedValue({ userId: "admin-1" })
    mockCheckIsListAdmin.mockResolvedValue(true)
    mockInviteGet.mockResolvedValue({ exists: true })
    mockInviteDelete.mockResolvedValue(undefined)
  })

  it("rejects unauthenticated callers", async () => {
    mockGetUserDataServer.mockResolvedValue(null)

    const result = await deleteInvite("list-1", "code-1")

    expect(result).toEqual({
      success: false,
      error: "User not authenticated.",
    })
    expect(mockCheckIsListAdmin).not.toHaveBeenCalled()
  })

  it("rejects non-admin callers", async () => {
    mockCheckIsListAdmin.mockResolvedValue(false)

    const result = await deleteInvite("list-1", "code-1")

    expect(result).toEqual({
      success: false,
      error: "Only administrators can delete invite codes.",
    })
    expect(mockInviteDelete).not.toHaveBeenCalled()
  })

  it("returns error when invite is missing", async () => {
    mockInviteGet.mockResolvedValue({ exists: false })

    const result = await deleteInvite("list-1", "code-1")

    expect(result).toEqual({
      success: false,
      error: "Invitation code not found.",
    })
  })

  it("deletes invite when caller is admin", async () => {
    const result = await deleteInvite("list-1", "code-1")

    expect(result).toEqual({ success: true, data: undefined })
    expect(mockInviteDelete).toHaveBeenCalled()
    expect(mockUpdateTag).toHaveBeenCalledWith("list-list-1-invites")
    expect(mockUpdateTag).toHaveBeenCalledWith("invite-code-1")
    expect(mockRevalidateTag).toHaveBeenCalledWith("list-list-1-invites", {
      expire: 0,
    })
    expect(mockRevalidateTag).toHaveBeenCalledWith("invite-code-1", {
      expire: 0,
    })
  })
})
