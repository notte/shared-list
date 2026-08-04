import { test, expect } from "@playwright/test"
import {
  addInviteAndGetCode,
  createCardViaUi,
  createList,
  expectToast,
  joinList,
  newUserContext,
  uniqueName,
} from "./helpers/ui"
import { deleteListTree, unpublishedDates } from "./helpers/firebase"

test.describe("P1 permission boundaries", () => {
  test("members page is admin-only", async ({ page, browser }) => {
    const listTitle = uniqueName("P1Mem")
    const listId = await createList(page, {
      title: listTitle,
      userName: uniqueName("Admin"),
    })

    try {
      await page.goto(`/lists/${listId}/members`)
      await expect(
        page.getByRole("heading", { name: "Member List" }),
      ).toBeVisible()

      const inviteCode = await addInviteAndGetCode(page, listId)
      const member = await newUserContext(browser)
      try {
        await joinList(member.page, inviteCode, uniqueName("Mem"))
        await member.page.goto(`/lists/${listId}/members`)
        await expect(
          member.page.getByRole("heading", { name: "Access Denied" }),
        ).toBeVisible({ timeout: 15_000 })
      } finally {
        await member.context.close()
      }
    } finally {
      await deleteListTree(listId).catch(() => undefined)
    }
  })

  test("non-creator cannot see edit/delete on others cards", async ({
    page,
    browser,
  }) => {
    const listTitle = uniqueName("P1Card")
    const listId = await createList(page, {
      title: listTitle,
      userName: uniqueName("Owner"),
    })

    try {
      // Unpublished: creator sees edit/delete
      const draftTitle = uniqueName("Draft")
      await page.goto(`/lists/${listId}`)
      await createCardViaUi(page, {
        cardType: "announce",
        title: draftTitle,
        dates: unpublishedDates(),
      })

      const ownerDraft = page
        .locator(".card-container")
        .filter({ hasText: draftTitle })
      await expect(ownerDraft.getByRole("button", { name: "edit" })).toBeVisible()
      await expect(
        ownerDraft.getByRole("button", { name: "delete" }),
      ).toBeVisible()

      // Published: member sees card but not edit/delete
      const liveTitle = uniqueName("Live")
      await createCardViaUi(page, {
        cardType: "announce",
        title: liveTitle,
      })

      const inviteCode = await addInviteAndGetCode(page, listId)
      const member = await newUserContext(browser)
      try {
        await joinList(member.page, inviteCode, uniqueName("Other"))
        await member.page.goto(`/lists/${listId}`)

        // Draft should be hidden from non-creator
        await expect(
          member.page.getByRole("heading", { name: draftTitle }),
        ).toHaveCount(0)

        const memberCard = member.page
          .locator(".card-container")
          .filter({ hasText: liveTitle })
        await expect(memberCard).toBeVisible({ timeout: 15_000 })
        await expect(
          memberCard.getByRole("button", { name: "edit" }),
        ).toHaveCount(0)
        await expect(
          memberCard.getByRole("button", { name: "delete" }),
        ).toHaveCount(0)
        await expect(
          memberCard.getByRole("button", { name: "read more" }),
        ).toBeVisible()
      } finally {
        await member.context.close()
      }
    } finally {
      await deleteListTree(listId).catch(() => undefined)
    }
  })

  test("deleted invite cannot be reused", async ({ page, browser }) => {
    const listTitle = uniqueName("P1Inv")
    const listId = await createList(page, {
      title: listTitle,
      userName: uniqueName("Admin"),
    })

    try {
      const inviteCode = await addInviteAndGetCode(page, listId)

      const pendingRow = page
        .locator(".card-container")
        .filter({ hasText: inviteCode })
      await pendingRow.getByRole("button", { name: "Delete" }).click()
      await expect(page.getByText("Revoke Invitation?")).toBeVisible()
      await page.getByRole("button", { name: "Revoke" }).click()
      await expectToast(page, "Invite Code successfully deleted.")
      await expect(page.getByText(inviteCode)).toHaveCount(0, { timeout: 15_000 })

      const stranger = await newUserContext(browser)
      try {
        await stranger.page.goto(`/join/${inviteCode}`)
        await expect(
          stranger.page.getByRole("heading", { name: "Not Found" }),
        ).toBeVisible({ timeout: 15_000 })
        await expect(stranger.page).not.toHaveURL(
          new RegExp(`/lists/${listId}$`),
        )
      } finally {
        await stranger.context.close()
      }
    } finally {
      await deleteListTree(listId).catch(() => undefined)
    }
  })
})
