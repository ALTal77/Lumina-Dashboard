# Lumina Dashboard — Agent Instructions

## Working principles (senior engineer)
- **Preserve architecture & conventions.** Match the existing structure, component patterns, naming, and data flow exactly. Do not invent parallel patterns, new top-level directories, or alternate state-management approaches. Extend what exists; refactor only when required and justified.
- **Follow the established layering.** Frontend UI → `src/api/*` → backend `routes/` handlers → `db`/utils. Keep UI logic out of API/client modules and vice versa. Respect the role-based separation (admin / doctor / patient) already wired in both `App.tsx` routes and backend routes.
- **Consistency over novelty.** Reuse existing shared components, hooks, `types`, i18n keys, and mock/API sources. If a feature already has a home, use it. Prefer symmetric, minimal diffs that fit the surrounding code style.
- **System design intent.** Preserve the two-app design (Vite SPA + Express/`node:sqlite` API over a Vite dev proxy) and its GitHub Pages + RTL/i18n constraints. Don't couple the frontend to the backend, or introduce behavior that breaks the proxy/localhost or `base: '/Lumina-Dashboard/'` assumptions.
- **Engineering rigor.** Verify every change. Keep DB schema changes idempotent like the existing `hasColumn` migrations. Don't leave dead code, debug logs, or hardcoded secrets.

## Project layout
- Root = frontend: Vite + React + TypeScript + Tailwind (`@tailwindcss/vite`), React Router (`HashRouter`), i18next (Arabic/English RTL).
- `lumina-backend/` = Express 5 API. The two are independent apps wired together by a Vite dev proxy.

## Commands
- Frontend (run in root): `npm run dev` (port 5173), `npm run build`, `npm run preview`.
- Backend: run in `lumina-backend/` with `npm run dev` (or `npm run start`) → port 4000. Requires **Node ≥ 22.13** (`engines`) because it uses the built-in `node:sqlite` (no better-sqlite3 dependency).
- **Use npm, not bun** even though both `bun.lock` and `package-lock.json` exist at the root — `package-lock.json` is authoritative and the seed/install used npm. Don't mix package managers.
- **No lint, test, or typecheck scripts exist** anywhere in the repo. There is no test framework. Verify changes with `npx tsc --noEmit` (root tsconfig has `noEmit` / `allowImportingTsExtensions`) and `npm run build`.

## Backend / DB quirks
- DB is auto-created **and seeded on first run** at `lumina-backend/data/lumina.db` (gitignored). Deleting the file reseeds. `lumina-backend/src/db/index.js` holds the schema, seed data, and idempotent `ALTER TABLE` migrations (add columns via `hasColumn`).
- Demo logins (from seed): admin `admin@lumina.health` / `Admin123!`; doctors `Doctor123!`; patient `patient@lumina.health` / `Patient123!`.
- Env: copy `lumina-backend/.env.example` → `.env` (set `JWT_SECRET`). `.env` is gitignored; change `JWT_SECRET` and demo values before any production use.

## Frontend quirks
- Routing is `HashRouter` (`src/App.tsx`) with Vite `base: '/Lumina-Dashboard/'` — both required for GitHub Pages.
- i18n: i18next with Arabic/English + RTL; translated doctor/department content lives in `src/data/mockData.ts` / `mockData-ar.ts`.
- Single data path: the frontend talks to the backend via `src/api/*` (JWT bearer token stored in localStorage `lumina-auth-token`). Path alias `@/*` → repo root.

## Deploy (manual)
- `dist/` is gitignored and never committed to the source branch. Deploying = `npm run build`, then force-push the built output to `origin/gh-pages`. There is **no Deploy script** in package.json — do it by hand.
