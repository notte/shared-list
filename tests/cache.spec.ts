import { test, expect } from "@playwright/test"
import {
  addInviteAndGetCode,
  createCardViaUi,
  createList,
  expectToast,
  fillLabeledInput,
  joinList,
  newUserContext,
  uniqueName,
} from "./helpers/ui"
import { deleteListTree, unpublishedDates } from "./helpers/firebase"

test.describe("P2 cache invalidation regressions", () => {
  test("deleted invite disappears after refresh", async ({ page }) => {
    const listId = await createList(page, {
      title: uniqueName("P2Inv"),
      userName: uniqueName("Admin"),
    })

    try {
      const inviteCode = await addInviteAndGetCode(page, listId)
      await expect(page.getByText(inviteCode)).toBeVisible()

      const pendingRow = page
        .locator(".card-container")
        .filter({ hasText: inviteCode })
      await pendingRow.getByRole("button", { name: "Delete" }).click()
      await page.getByRole("button", { name: "Revoke" }).click()
      await expectToast(page, "Invite Code successfully deleted.")

      await page.reload()
      await expect(
        page.getByRole("heading", { name: "Member List" }),
      ).toBeVisible()
      await expect(page.getByText(inviteCode)).toHaveCount(0)
    } finally {
      await deleteListTree(listId).catch(() => undefined)
    }
  })

  test("mark as read reflects on list after navigation", async ({
    page,
    browser,
  }) => {
    const listId = await createList(page, {
      title: uniqueName("P2Read"),
      userName: uniqueName("Admin"),
    })

    try {
      const cardTitle = uniqueName("ReadMe")
      await page.goto(`/lists/${listId}`)
      await createCardViaUi(page, {
        cardType: "announce",
        title: cardTitle,
      })

      const inviteCode = await addInviteAndGetCode(page, listId)
      const reader = await newUserContext(browser)
      try {
        await joinList(reader.page, inviteCode, uniqueName("Rdr"))
        await reader.page.goto(`/lists/${listId}`)
        await reader.page
          .locator(".card-container")
          .filter({ hasText: cardTitle })
          .getByRole("button", { name: "read more" })
          .click()

        await reader.page.getByRole("button", { name: "Mark as Read" }).click()
        await expectToast(reader.page, "Card successfully marked as read.")
        await expect(
          reader.page.getByRole("button", { name: "Already Read" }),
        ).toBeVisible()

        // Navigate away and back — detail should still show Already Read
        // (list-cards tag invalidation regression)
        await reader.page.goto(`/lists/${listId}`)
        await reader.page
          .locator(".card-container")
          .filter({ hasText: cardTitle })
          .getByRole("button", { name: "read more" })
          .click()
        await expect(
          reader.page.getByRole("button", { name: "Already Read" }),
        ).toBeVisible({ timeout: 15_000 })
      } finally {
        await reader.context.close()
      }
    } finally {
      await deleteListTree(listId).catch(() => undefined)
    }
  })

  test("create / edit / delete card updates list", async ({ page }) => {
    const listId = await createList(page, {
      title: uniqueName("P2Crud"),
      userName: uniqueName("Admin"),
    })

    try {
      const createdTitle = uniqueName("NewC")
      await page.goto(`/lists/${listId}`)
      await createCardViaUi(page, {
        cardType: "announce",
        title: createdTitle,
      })
      await expect(
        page.getByRole("heading", { name: createdTitle }),
      ).toBeVisible()

      // Edit unpublished card
      const editTitle = uniqueName("EditMe")
      await createCardViaUi(page, {
        cardType: "announce",
        title: editTitle,
        dates: unpublishedDates(),
      })

      const editCard = page
        .locator(".card-container")
        .filter({ hasText: editTitle })
      await expect(editCard).toBeVisible({ timeout: 15_000 })
      await editCard.getByRole("button", { name: "edit" }).click()
      await expect(page.getByRole("heading", { name: "Edit Card" })).toBeVisible()

      const updatedTitle = uniqueName("Edited")
      await fillLabeledInput(page, "Title", updatedTitle)
      await page.getByRole("button", { name: "Submit" }).click()
      await expectToast(page, "Card updated successfully.")
      await expect(
        page.getByRole("heading", { name: updatedTitle }),
      ).toBeVisible({ timeout: 15_000 })
      await expect(page.getByRole("heading", { name: editTitle })).toHaveCount(0)

      // Delete
      const delCard = page
        .locator(".card-container")
        .filter({ hasText: updatedTitle })
      await delCard.getByRole("button", { name: "delete" }).click()
      await expect(page.getByText("Remove Card？")).toBeVisible()
      await page.getByRole("button", { name: "Delete" }).click()
      await expectToast(page, "Card successfully deleted.")
      await expect(page.getByRole("heading", { name: updatedTitle })).toHaveCount(
        0,
        { timeout: 15_000 },
      )
    } finally {
      await deleteListTree(listId).catch(() => undefined)
    }
  })
})
