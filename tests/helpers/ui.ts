import {
  expect,
  type Browser,
  type BrowserContext,
  type Locator,
  type Page,
} from "@playwright/test"
import { formatDateInput, futureDates } from "./firebase"

export const COOKIE_USER_ID = "anonymous_user_id"
export const COOKIE_USER_COLOR = "anonymous_user_color"
export const COOKIE_USER_NAME = "anonymous_user_name"

type Scope = Page | Locator

export async function waitForFirebaseAuth(page: Page) {
  await page.waitForLoadState("domcontentloaded")
  await page.waitForTimeout(1200)
}

function labelLocator(scope: Scope, label: string) {
  return scope
    .locator(".input-label, label")
    .filter({ hasText: new RegExp(`^${escapeRegExp(label)}$`) })
    .first()
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Input associated with a HeadlessUI Field label (sibling under same Field). */
async function inputForLabel(scope: Scope, label: string) {
  const labelEl = labelLocator(scope, label)
  await expect(labelEl).toBeVisible({ timeout: 15_000 })
  await labelEl.scrollIntoViewIfNeeded()
  // Field > Label + Input: walk up to Field container then find input
  const field = labelEl.locator(
    "xpath=ancestor::*[.//input[contains(@class,'input') or self::input]][1]",
  )
  const input = field.locator("input").first()
  await expect(input).toBeVisible({ timeout: 10_000 })
  await input.scrollIntoViewIfNeeded()
  return input
}

export async function fillLabeledInput(
  scope: Scope,
  label: string,
  value: string,
) {
  const byLabel =
    "getByLabel" in scope
      ? (scope as Page).getByLabel(label, { exact: true })
      : (scope as Locator).page().getByLabel(label, { exact: true })

  if ((await byLabel.count()) > 0 && (await byLabel.first().isVisible())) {
    await byLabel.first().scrollIntoViewIfNeeded()
    await byLabel.first().fill(value)
    return
  }

  const input = await inputForLabel(scope, label)
  await input.fill(value)
}

export async function selectByLabel(
  scope: Scope,
  label: string,
  optionLabel: string,
) {
  const labelEl = labelLocator(scope, label)
  await labelEl.scrollIntoViewIfNeeded()
  const field = labelEl.locator("xpath=ancestor::div[contains(@class,'w-full')][1]")
  await field.getByRole("button").first().click()
  const page = "page" in scope && typeof scope.page === "function"
    ? scope.page()
    : (scope as Page)
  await page
    .locator(".select-item")
    .filter({ hasText: new RegExp(`^${escapeRegExp(optionLabel)}$`) })
    .first()
    .click()
}

export async function fillTiptap(scope: Scope, text: string) {
  const editor = scope.locator('[contenteditable="true"]').last()
  await editor.scrollIntoViewIfNeeded()
  await editor.click()
  await editor.fill(text)
}

export async function fillDateByLabel(
  scope: Scope,
  label: string,
  date: Date,
) {
  const value = formatDateInput(date)
  const input = await inputForLabel(scope, label)
  await input.click({ force: true })
  await input.fill(value)
  // Close date popover if open
  const page =
    "page" in scope && typeof (scope as Locator).page === "function"
      ? (scope as Locator).page()
      : (scope as Page)
  await page.keyboard.press("Escape")
  await page.waitForTimeout(150)
}

export async function expectToast(page: Page, message: string | RegExp) {
  await expect(
    page.locator(".toast").filter({ hasText: message }),
  ).toBeVisible({
    timeout: 15_000,
  })
}

export async function createList(
  page: Page,
  opts: { title: string; userName: string },
) {
  await page.goto("/")
  await expect(
    page.getByRole("heading", { name: "Landing Page" }),
  ).toBeVisible()
  await waitForFirebaseAuth(page)
  await fillLabeledInput(page, "List Name", opts.title)
  await fillLabeledInput(page, "Creator Nickname", opts.userName)

  await page.getByRole("button", { name: "Submit" }).click()

  const authError = page.locator(".toast").filter({
    hasText: "The user is not logged in",
  })
  if (await authError.isVisible().catch(() => false)) {
    await waitForFirebaseAuth(page)
    await page.getByRole("button", { name: "Submit" }).click()
  }

  await page.waitForURL(/\/lists\/[^/]+$/, { timeout: 30_000 })
  const listId = page.url().split("/lists/")[1]!.split(/[?#]/)[0]!
  await expect(page.getByRole("heading", { name: opts.title })).toBeVisible()
  return listId
}

export async function openCreateCardDialog(page: Page) {
  const url = page.url()
  const match = url.match(/\/lists\/([^/?#]+)/)
  if (match && !/\/lists\/[^/]+$/.test(new URL(url).pathname)) {
    await page.goto(`/lists/${match[1]}`)
  }
  await expect(page.locator("nav").getByRole("button").last()).toBeVisible({
    timeout: 15_000,
  })
  await page.locator("nav").getByRole("button").last().click()
  await expect(
    page.getByRole("heading", { name: "Create Card" }),
  ).toBeVisible()
  return page.getByRole("dialog")
}

export async function openMembersPage(page: Page, listId: string) {
  await page.goto(`/lists/${listId}/members`)
}

export async function createCardViaUi(
  page: Page,
  opts: {
    cardType: "announce" | "vote"
    title: string
    description?: string
    content?: string
    options?: string[]
    dates?: ReturnType<typeof futureDates>
  },
) {
  const dates = opts.dates ?? futureDates()
  const dialog = await openCreateCardDialog(page)

  if (opts.cardType === "vote") {
    await selectByLabel(dialog, "Card Type", "vote")
  }

  await fillLabeledInput(dialog, "Title", opts.title)
  await fillLabeledInput(dialog, "Description", opts.description ?? "e2e desc")
  await fillTiptap(dialog, opts.content ?? "e2e body content")

  // Order: publish < event < end (schema)
  await fillDateByLabel(dialog, "Publish Time", dates.publish)
  await fillDateByLabel(dialog, "Event Time", dates.event)
  await fillDateByLabel(dialog, "End Time", dates.end)

  if (opts.cardType === "vote") {
    const options = opts.options ?? ["Option A", "Option B"]
    for (let i = 0; i < options.length; i++) {
      await dialog.getByRole("button", { name: "Add Option" }).click()
    }
    const optionInputs = dialog.locator(".space-y-2 input")
    await expect(optionInputs).toHaveCount(options.length)
    for (let i = 0; i < options.length; i++) {
      await optionInputs.nth(i).fill(options[i]!)
    }
  }

  await dialog.getByRole("button", { name: "Submit" }).click()
  await expectToast(page, "Card created successfully.")
  await expect(page.getByRole("heading", { name: "Create Card" })).toBeHidden({
    timeout: 10_000,
  })
  await expect(page.getByRole("heading", { name: opts.title })).toBeVisible({
    timeout: 15_000,
  })
}

export async function addInviteAndGetCode(page: Page, listId: string) {
  await openMembersPage(page, listId)
  await expect(
    page.getByRole("heading", { name: "Member List" }),
  ).toBeVisible()

  await page.getByRole("button", { name: "Add Member" }).click()
  await expectToast(page, "Invite created.")

  const pendingRow = page
    .locator(".card-container")
    .filter({ hasText: "pending" })
    .first()
  await expect(pendingRow).toBeVisible({ timeout: 15_000 })
  const text = await pendingRow.innerText()
  const match = text.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  )
  if (!match) throw new Error(`Invite code not found in row: ${text}`)
  return match[0]
}

export async function joinList(
  page: Page,
  inviteCode: string,
  userName: string,
) {
  await page.goto(`/join/${inviteCode}`)
  await waitForFirebaseAuth(page)
  await fillLabeledInput(page, "Display Name", userName)
  await page.getByRole("button", { name: "Yes, Join List" }).click()
  await expect(page.getByText("Join this list？")).toBeVisible()
  await page.getByRole("button", { name: "Yes, Join" }).click()

  const authError = page.locator(".toast").filter({
    hasText: "The user is not logged in",
  })
  if (await authError.isVisible().catch(() => false)) {
    await waitForFirebaseAuth(page)
    await page.getByRole("button", { name: "Yes, Join List" }).click()
    await page.getByRole("button", { name: "Yes, Join" }).click()
  }

  await page.waitForURL(/\/lists\/[^/]+$/, { timeout: 30_000 })
  const listId = page.url().split("/lists/")[1]!.split(/[?#]/)[0]!
  return listId
}

export async function getUserCookies(context: BrowserContext) {
  const cookies = await context.cookies()
  const id = cookies.find((c) => c.name === COOKIE_USER_ID)?.value
  const name = cookies.find((c) => c.name === COOKIE_USER_NAME)?.value
  const color = cookies.find((c) => c.name === COOKIE_USER_COLOR)?.value
  return { userId: id, userName: name, color }
}

export async function newUserContext(browser: Browser) {
  const context = await browser.newContext()
  const page = await context.newPage()
  return { context, page }
}

export function uniqueName(prefix: string) {
  const stamp = Date.now().toString(36).slice(-5)
  return `${prefix}${stamp}`.slice(0, 15)
}
