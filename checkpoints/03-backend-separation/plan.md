# Checkpoint 03 — Backend Logic Separation

## Goal

Guarantee every piece of business logic lives in `src/services` (or a pure
`src/utils` helper), controllers are thin adapters that only wire request →
service → response, and the separation is enforced by tests and the debug
harness.

## Context

The backend already follows controllers → services → models. Controllers are
mostly thin (`auth`, `dashboard`, `balance`). Some controllers may still do
response shaping / small computations inline (e.g. `group`, `expense`,
`summary`, `payment`, `activity`, `reaction`) — this checkpoint audits each one
and extracts anything non-trivial.

## Deliverables

1. Audit all 9 controllers (`backend/src/controllers/*`) for inline logic
   (mapping, aggregation, response shaping, calculations) that belongs in a
   service or util. Extract to `src/services/*` (or `src/utils/*`) — no change
   in observable behavior.
2. Keep controllers as: validate (via middleware) → call service → return
   `{ success, message?, data }` with the correct HTTP status.
3. Confirm services have no HTTP imports (`res`/`req`); add/fix where broken.
4. Add unit tests for any newly extracted helpers in `backend/__tests__/`.
5. Register any newly testable service methods in the checkpoint-00 service
   registry so the debug CLI exposes them.

## Acceptance criteria (parity review)

- Controller audit: no controller contains inline aggregation/computation
  beyond a single service call and response envelope (grep-based review).
- Existing jest suite stays green; new tests cover extracted helpers.
- `node scripts/debug-cli.js --list` shows the newly exposed service methods.
- `sha256sum -c checkpoints/03-backend-separation/plan.lock` passes.
- `npm test` passes.

## Out of scope

- API contract changes, new endpoints, schema/migration changes.
- Auth/security behavior changes.