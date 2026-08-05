# Shared List

A real-time collaborative list app built with Next.js and Firebase. Create a list, invite others with a link, and post announcement or vote cards that everyone in the list can see and respond to.

**Live demo:** https://shared-list-mu.vercel.app

## Features

- **Anonymous, link-based collaboration** — no sign-up required; join a list via an invite link and get a Firebase anonymous identity plus a display name/color stored in cookies.
- **List membership** — admins can create invite links and remove members; access to `/lists/*` is gated by middleware for non-members.
- **Announcement cards** — rich text content (Tiptap editor), publish/end time, optional event time and address, read receipts per member.
- **Vote cards** — single or multiple choice voting with configurable max choices, live vote counts, and a "closed" state.
- **Real-time-friendly caching** — server reads use Next.js `unstable_cache` with tags, revalidated on every mutation so all members stay in sync.

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Actions)
- [React 19](https://react.dev)
- [Firebase](https://firebase.google.com) — Firestore, Auth (Anonymous), Admin SDK
- [Tailwind CSS 4](https://tailwindcss.com)
- [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev)
- [Tiptap](https://tiptap.dev) rich text editor
- [Vitest](https://vitest.dev) (unit) + [Playwright](https://playwright.dev) (E2E)

## Getting Started

### Prerequisites

- Node.js
- pnpm (`packageManager` pinned in `package.json`, use pnpm — not npm/yarn/bun)
- A Firebase project (Firestore + Anonymous Auth enabled)

### Setup

```bash
pnpm install
```

Create a `.env.local` file with your Firebase credentials:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "service_account", ...}'
```

Run the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
pnpm dev              # start dev server
pnpm build            # production build
pnpm start            # start production server
pnpm lint             # ESLint
pnpm test             # Vitest (watch)
pnpm test:run         # Vitest (single run)
pnpm test:coverage    # Vitest with coverage report
pnpm test:e2e         # Playwright E2E
pnpm test:e2e:ui      # Playwright E2E, UI mode
```

## Project Structure

```
app/                  App Router routes (/, /lists/[listId], /join/[inviteCode], ...)
features/             Domain modules: cards, lists (actions, components, schemas, adapters)
components/           Shared UI components + providers
services/db/          Firestore reads (Admin SDK, cached + tagged)
services/storage/     User cookie/session handling
lib/                  Firebase client/admin, date/theme/toast helpers
types/                Shared enums and ActionResult<T>
tests/                Playwright E2E specs
```

See [`AGENTS.md`](./AGENTS.md) for a more detailed architecture and conventions reference.

## Testing

Unit tests are colocated with the source files (`*.test.ts`). E2E tests live under `tests/` and require a real Firebase project since they exercise the Admin SDK.

## License

MIT
