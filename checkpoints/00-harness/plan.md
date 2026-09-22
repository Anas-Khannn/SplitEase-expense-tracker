# Checkpoint 00 — Debug / Introspection Harness

## Goal

Build the harness first so every later checkpoint (and any debugging session)
has fast, structured access to running state without driving the UI or curling
endpoints by hand. This is the SplitEase equivalent of Shopify's Tardis.

## Context

- Backend: Express + Sequelize + Postgres. Services (`src/services/*`) hold
  business logic; controllers route to them. `src/app.js` listens when
  NODE_ENV is not `test`.
- Frontend: Next.js 16 App Router, client components, TanStack Query hooks,
  `services/*` thin API modules. There is currently **no** test tooling in the
  frontend (`vitest`, jest, RTL all absent).

## Backend deliverables

1. `backend/scripts/debug-cli.js`
   - `node scripts/debug-cli.js --list` — prints the registry of callable
     services and their methods.
   - `node scripts/debug-cli.js <service>.<method> [argsJson]` — calls the
     exported method of a registered service directly (loaded through
     `src/services`), prints `{ success, result }` as JSON to stdout, exits
     non-zero and prints `{ success: false, error }` on failure.
   - Requires sequelize models (they initialize via `src/config/database`),
     does **not** start an HTTP server. Supported because services have no
     HTTP dependency.
   - Registry lives in a new `backend/src/utils/service-registry.js` so it can
     also be used by the debug route.
2. `backend/src/routes/debug.routes.js` — dev-only route mounted in `src/app.js`
   only when `process.env.NODE_ENV !== "production"`:
   - `GET /api/debug/services` — list registered services/methods.
   - `GET /api/debug/service/:service/:method?args=<json>` — invoke and return
     `{ success, result }` (or `{ success: false, error }`). `args` is an
     optional JSON-encoded array. No auth required (never mounted in prod).

## Frontend deliverables

1. Add devDependencies: `vitest`, `@vitejs/plugin-react`, `jsdom`,
   `@testing-library/react`, `@testing-library/jest-dom`. Add npm scripts:
   `test`, `test:run`, `harness:dump`.
2. `frontend/vitest.config.ts` — react plugin, `jsdom`, `@` alias to project
   root, jest-dom setup file.
3. `frontend/harness/render.tsx` — headless component registry: maps a
   component name to its implementation and exports `renderAndDump(name, props)`
   which renders the component with React Testing Library (no browser) and
   returns `{ html }` (container.innerHTML) serialized as JSON.
4. `frontend/harness/dump.test.tsx` — a single vitest test that reads
   `HARNESS_COMPONENT` and `HARNESS_PROPS` (JSON) env vars, renders via
   `renderAndDump`, and writes the JSON result to stdout (or to the file in
   `HARNESS_OUTPUT` if provided). Run: `npm run harness:dump`.
5. Smoke-test the harness against at least one real component (e.g.
   `ExpenseList`) and one pure module to prove the path works.

## Acceptance criteria (parity review)

- `node scripts/debug-cli.js --list` prints registered services.
- `node scripts/debug-cli.js auth.getMe '<userId>'` returns user JSON.
- `GET /api/debug/service/auth/getMe?args=<json>` returns JSON with
  `success: true` when run with NODE_ENV=development.
- `npm run harness:dump` renders a component and emits JSON HTML without a
  browser.
- `sha256sum -c checkpoints/00-harness/plan.lock` passes (plan unchanged since
  approval).

## Out of scope

- Any feature work. No changes to existing business logic or page content.
- No change of the frontend build or backend runtime behavior.