import { loadEnvLocal } from "./env"

loadEnvLocal()

import { initializeApp, getApps, cert, App } from "firebase-admin/app"
import {
  getFirestore,
  Firestore,
  Timestamp,
  type CollectionReference,
} from "firebase-admin/firestore"
import { getAuth, Auth } from "firebase-admin/auth"
import { randomUUID } from "node:crypto"

let app: App
let db: Firestore
let auth: Auth

function ensureAdmin() {
  if (getApps().length === 0) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    if (!raw) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_KEY is missing. Set it in .env.local for e2e.",
      )
    }
    const serviceAccount = JSON.parse(raw)
    app = initializeApp({ credential: cert(serviceAccount) })
    getFirestore().settings({ ignoreUndefinedProperties: true })
  } else {
    app = getApps()[0]!
  }
  db = getFirestore(app)
  auth = getAuth(app)
  return { db, auth }
}

export function getAdmin() {
  return ensureAdmin()
}

export type SeedUser = {
  userId: string
  userName: string
  color: string
}

export type SeedCardInput = {
  title: string
  description?: string
  content?: string
  cardType: "announce" | "vote"
  publishTime: Date
  endTime: Date
  eventTime?: Date
  address?: string
  createdBy: SeedUser
  readBy?: string[]
  vote?: {
    isMultipleChoice: boolean
    maxChoices: number
    options: { voteOptionId: string; text: string; voteCount: number }[]
  }
}

export async function seedInvite(
  listId: string,
  title: string,
  creator: string,
) {
  const { db } = getAdmin()
  const inviteCode = randomUUID()
  await db.collection("invites").doc(inviteCode).set({
    listId,
    title,
    creator,
    createdAt: Timestamp.now(),
    expiredAt: null,
  })
  return inviteCode
}

export async function seedCard(listId: string, input: SeedCardInput) {
  const { db } = getAdmin()
  const ref = db.collection("lists").doc(listId).collection("cards").doc()
  const eventTime =
    input.eventTime ?? new Date(Date.now() + 24 * 60 * 60 * 1000)
  const data = {
    cardId: ref.id,
    title: input.title,
    description: input.description ?? "e2e description",
    content: input.content ?? "<p>e2e content</p>",
    cardType: input.cardType,
    publishTime: Timestamp.fromDate(input.publishTime),
    endTime: Timestamp.fromDate(input.endTime),
    eventTime: Timestamp.fromDate(eventTime),
    eventStartTime: null,
    eventEndTime: null,
    address: input.address ?? "",
    vote: input.cardType === "vote" ? (input.vote ?? null) : null,
    createdAt: Timestamp.now(),
    createdBy: input.createdBy,
    readBy: input.readBy ?? [input.createdBy.userId],
  }
  await ref.set(data)
  return ref.id
}

export async function deleteInvite(inviteCode: string) {
  const { db } = getAdmin()
  await db.collection("invites").doc(inviteCode).delete()
}

export async function getInvite(inviteCode: string) {
  const { db } = getAdmin()
  const snap = await db.collection("invites").doc(inviteCode).get()
  return snap.exists ? snap.data() : null
}

export async function clearCardReadBy(listId: string, cardId: string) {
  const { db } = getAdmin()
  await db
    .collection("lists")
    .doc(listId)
    .collection("cards")
    .doc(cardId)
    .update({ readBy: [] })
}

export async function deleteListTree(listId: string) {
  const { db } = getAdmin()
  const listRef = db.collection("lists").doc(listId)

  const deleteCollection = async (col: CollectionReference) => {
    const snap = await col.get()
    const batch = db.batch()
    snap.docs.forEach((doc) => batch.delete(doc.ref))
    if (!snap.empty) await batch.commit()
  }

  const cardsSnap = await listRef.collection("cards").get()
  for (const card of cardsSnap.docs) {
    await deleteCollection(card.ref.collection("voteRecords"))
    await card.ref.delete()
  }
  await deleteCollection(listRef.collection("members"))

  const invites = await db
    .collection("invites")
    .where("listId", "==", listId)
    .get()
  const inviteBatch = db.batch()
  invites.docs.forEach((doc) => inviteBatch.delete(doc.ref))
  if (!invites.empty) await inviteBatch.commit()

  await listRef.delete()
}

export function futureDates() {
  const now = new Date()
  const publish = new Date(now)
  publish.setMinutes(publish.getMinutes() - 5)

  const event = new Date(now)
  event.setDate(event.getDate() + 1)
  event.setHours(12, 0, 0, 0)

  const end = new Date(now)
  end.setDate(end.getDate() + 2)
  end.setHours(18, 0, 0, 0)

  return { publish, event, end }
}

export function unpublishedDates() {
  const now = new Date()
  const publish = new Date(now)
  publish.setDate(publish.getDate() + 1)
  publish.setHours(10, 0, 0, 0)

  const event = new Date(now)
  event.setDate(event.getDate() + 2)
  event.setHours(12, 0, 0, 0)

  const end = new Date(now)
  end.setDate(end.getDate() + 3)
  end.setHours(18, 0, 0, 0)

  return { publish, event, end }
}

export function formatDateInput(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const hh = String(date.getHours()).padStart(2, "0")
  const mm = String(date.getMinutes()).padStart(2, "0")
  return `${y}/${m}/${d} ${hh}:${mm}`
}
