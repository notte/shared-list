# Agent Instructions

## Commands

```bash
pnpm dev                  # Next.js dev server (localhost:3000)
pnpm build                # Production build
pnpm start                # Production server (after build)
pnpm lint                 # ESLint (next/core-web-vitals + typescript)
pnpm test                 # Vitest watch
pnpm test:run             # Vitest CI / single run
pnpm test:coverage        # Vitest coverage (html → coverage/)
pnpm exec vitest run PATH # Vitest single file/directory
pnpm test:e2e             # Playwright E2E (build + start webServer)
pnpm test:e2e:ui          # Playwright UI mode
```

No separate typecheck script — use `pnpm build` or `pnpm exec tsc --noEmit`.

Debug: `.vscode/launch.json` (Next.js dev/server/full-stack, Vitest current/all, Chrome attach).

## Constraints agents miss

- **pnpm only** (`packageManager`: pnpm@11.18.0). Do not use npm/yarn/bun.
- **Path alias** `@/*` → project root (`./`), not `./src`.
- **Env** (`.env.local`, gitignored): client needs `NEXT_PUBLIC_FIREBASE_*`; server/admin needs `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string, may be multi-line single-quoted). Admin init parses that key at import time (`lib/firebase.admin.ts`).
- **CSS**: Tailwind v4 via `@import "tailwindcss"` in `styles/globals.css`. Theme colors are CSS variables exposed in `@theme inline` (e.g. `text-clay`, `bg-background`). Prefer those over arbitrary hex classes.
- **Do not edit** `next-env.d.ts` or `.next/types/**`.
- **Auth gate**: `proxy.ts` redirects unauthenticated `/lists/*` → `/forbidden` (cookie user via `services/storage/user.server`).
- **tsconfig exclude**: `tests/` and `playwright.config.ts` are excluded from Next/tsc so Playwright config does not break `pnpm build`.
- **No `data-testid`s** in the app — UI tests use roles/labels/text. Icon nav buttons (home, members, create card) often have **no accessible name**.

## Layout

- `app/` — App Router routes only (`/`, `/lists/[listId]`, `/lists/[listId]/cards/[cardId]`, `/lists/[listId]/members`, `/join/[inviteCode]`, `/forbidden`)
- `app/lists/[listId]/_components/` — list layout nav (`NavLeft`, `NavRight`)
- `features/{cards,lists}/` — domain modules: `actions/` (`"use server"`), `components/{client,server}/`, `schemas/`, `adapters/`
- `components/{ui,shared}/` — shared UI + AuthProvider/ToastProvider
- `services/db/` — Firestore reads (admin SDK, React `cache` / `unstable_cache` + tags)
- `services/storage/` — user cookie/session (`user.server` / `user.client`; keys in `constants.ts`)
- `lib/` — `firebase.client`, `firebase.admin`, date/theme/toast helpers
- `types/` — shared enums + `ActionResult<T>`
- `tests/` — Playwright E2E only (`*.spec.ts` + `helpers/`)
- `proxy.ts` — Next.js proxy/middleware gate for `/lists/*`
- `.vscode/` — launch/debug configs

## Auth model

- Firebase **anonymous** auth (`AuthProvider` → `signInAnonymously`) + browser cookies:
  - `anonymous_user_id`, `anonymous_user_color`, `anonymous_user_name`
- Create/join list send Firebase **ID token** to server actions; most card/list mutations use **cookie** identity via `getUserDataServer()`.
- Two browser contexts = two users (creator vs joiner). Clearing site data loses access.

## Conventions

- Server actions return `ActionResult<T>` (`{ success: true, data } | { success: false, error }`).
- Feature UI split is by folder name `client/` vs `server/` under `features/*/components/`, not under top-level `components/`.
- Forms: `react-hook-form` + zod schemas in `features/*/schemas/`.
- Cache: reads use `unstable_cache` with tags like `list-${listId}-cards`, `list-${listId}-invites`, `list-members-${listId}`, `card-${cardId}`; mutations must `updateTag` / `revalidateTag` / `revalidatePath` accordingly.
- Prettier: no semicolons, double quotes, trailing commas, printWidth 80.
- Firestore shape (high level): `lists/{listId}`, `lists/{listId}/members/{userId}`, `lists/{listId}/cards/{cardId}`, top-level `invites/{inviteCode}`.

## Unit testing (Vitest)

- Filename: `*.test.ts` / `*.test.tsx`, **colocated** next to the file under test (not under `tests/`).
- Config: `vitest.config.mts` (jsdom, `@/` alias). Excludes `tests/**` so Playwright specs are not picked up.
- Prioritize pure: `lib/*`, zod schemas, extracted helpers.
- Server actions / Firebase: extract pure first, then mock; **do not** init admin in global setup (`vitest.setup.ts`). Mock `lib/firebase.admin` (it parses `FIREBASE_SERVICE_ACCOUNT_KEY` at import).
- Coverage threshold is currently 0; increase it after writing tests.
- Use `@/` for paths.

## E2E testing (Playwright)

- Specs: `tests/*.spec.ts` (P0 core flows, P1 permissions, P2 cache). Helpers: `tests/helpers/{env,firebase,ui}.ts`.
- Config: `playwright.config.ts` — `testDir: ./tests`, workers=1, `baseURL: http://localhost:3000`, webServer `pnpm build && pnpm start`, loads `.env.local` via `tests/helpers/env.ts`.
- Browser: `channel: "chrome"` (system Chrome). Playwright CDN browser download may time out; video is off (ffmpeg download). Prefer `pnpm exec playwright install chromium` when network allows.
- **Requires real Firebase** (prefer a dedicated test project). Uses Admin SDK for cleanup (`deleteListTree`) and optional seeding.
- Multi-user: `browser.newContext()` per identity; keep creator context alive across serial steps (cookies do not span default fixtures).
- UI helpers: scope form fills to the open dialog; DatePicker accepts typed `yyyy/MM/dd HH:mm`; wait for anonymous auth before create/join submit.
- Artifacts (gitignored): `test-results/`, `playwright-report/`.

## Plans / docs agents may see

- `e2e-test-plan.md` may exist as a planning doc; implementation lives under `tests/`. Prefer code + this file over stale plan notes.
