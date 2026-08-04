import { test, expect, type BrowserContext, type Page } from "@playwright/test"
import {
  addInviteAndGetCode,
  createCardViaUi,
  createList,
  expectToast,
  getUserCookies,
  joinList,
  newUserContext,
  uniqueName,
} from "./helpers/ui"
import { deleteListTree } from "./helpers/firebase"

test.describe.configure({ mode: "serial" })

test.describe("P0 core user flows", () => {
  let listId: string
  let listTitle: string
  let creatorContext: BrowserContext
  let creatorPage: Page

  test.afterAll(async () => {
    await creatorContext?.close().catch(() => undefined)
    if (listId) {
      await deleteListTree(listId).catch(() => undefined)
    }
  })

  test("create list, cards, join, vote, mark as read", async ({ browser }) => {
    creatorContext = await browser.newContext()
    creatorPage = await creatorContext.newPage()

    listTitle = uniqueName("List")
    const creatorName = uniqueName("Creator")
    listId = await createList(creatorPage, {
      title: listTitle,
      userName: creatorName,
    })

    expect(listId).toBeTruthy()
    await expect(
      creatorPage.getByRole("heading", { name: "No cards yet." }),
    ).toBeVisible()

    const cookies = await getUserCookies(creatorContext)
    expect(cookies.userId).toBeTruthy()
    expect(cookies.userName).toBe(creatorName)

    // Create announce + vote cards
    const announceTitle = uniqueName("Ann")
    await createCardViaUi(creatorPage, {
      cardType: "announce",
      title: announceTitle,
    })

    const voteTitle = uniqueName("Vote")
    await createCardViaUi(creatorPage, {
      cardType: "vote",
      title: voteTitle,
      options: ["Alpha", "Beta"],
    })

    await expect(
      creatorPage.getByRole("heading", { name: announceTitle }),
    ).toBeVisible()
    await expect(
      creatorPage.getByRole("heading", { name: voteTitle }),
    ).toBeVisible()

    // Join via invite
    const inviteCode = await addInviteAndGetCode(creatorPage, listId)
    const member = await newUserContext(browser)
    try {
      const joinedListId = await joinList(
        member.page,
        inviteCode,
        uniqueName("Member"),
      )
      expect(joinedListId).toBe(listId)

      const memberCookies = await getUserCookies(member.context)
      expect(memberCookies.userId).toBeTruthy()

      await member.page.goto(`/lists/${listId}`)
      await expect(
        member.page.getByRole("heading", { name: listTitle }),
      ).toBeVisible()
      await expect(
        member.page.getByRole("heading", { name: "Access Denied" }),
      ).toHaveCount(0)

      // Vote
      const voteCard = member.page
        .locator(".card-container")
        .filter({ hasText: voteTitle })
      await expect(voteCard).toBeVisible({ timeout: 15_000 })
      await voteCard.getByRole("button", { name: "read more" }).click()
      await member.page.waitForURL(/\/cards\//)

      await expect(member.page.getByText("Select one option.")).toBeVisible()
      await member.page.getByText("Alpha", { exact: true }).click()
      await member.page.getByRole("button", { name: "Submit Vote" }).click()
      await expectToast(member.page, "Vote successfully updated.")
      await expect(member.page.getByText(/1 votes/)).toBeVisible({
        timeout: 15_000,
      })

      // Mark announce as read
      await member.page.goto(`/lists/${listId}`)
      const announceCard = member.page
        .locator(".card-container")
        .filter({ hasText: announceTitle })
      await announceCard.getByRole("button", { name: "read more" }).click()
      await member.page.waitForURL(/\/cards\//)

      await member.page.getByRole("button", { name: "Mark as Read" }).click()
      await expectToast(member.page, "Card successfully marked as read.")
      await expect(
        member.page.getByRole("button", { name: "Already Read" }),
      ).toBeVisible({ timeout: 15_000 })
      await expect(
        member.page.getByRole("button", { name: "Already Read" }),
      ).toBeDisabled()
    } finally {
      await member.context.close()
    }
  })
})
