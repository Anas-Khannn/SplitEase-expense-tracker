# SplitEase Checkpoints

Checkpoint-based development modeled on Shopify's Plan -> Approve -> Hash-lock ->
Implement -> Parity-review pipeline (adapted for a Next.js + Express web app).

## Process

Each checkpoint lives in `checkpoints/NN-name/`:

1. **Plan only** — the agent writes `plan.md` describing exactly what will be
   implemented and why. No implementation code is written yet.
2. **Human plan review** — you read the plan and either approve it or request
   edits to plan.md.
3. **Hash-lock** — once the plan is approved, the approval is pinned to that
   exact text:

   ```bash
   sha256sum checkpoints/NN-name/plan.md > checkpoints/NN-name/plan.lock
   ```

4. **Verify the lock** before (and after) implementing:

   ```bash
   sha256sum -c checkpoints/NN-name/plan.lock
   ```

   If this check fails, plan.md was edited after approval and re-approval is
   required before implementation may continue.
5. **Implement** against the locked plan only. If the plan needs to change,
   the change is a new plan revision that must be re-approved and re-locked —
   never a silent mid-implementation edit.
6. **Acceptance review** — run the parity/acceptance tests: the implementation
   is checked against the plan's stated criteria (via the harness in
   checkpoint 00 and the unit tests each checkpoint adds), not just "does it
   run".
7. **Human sign-off, merge, next checkpoint.**

## Checkpoints

- **00-harness** — debug/introspection harness (backend debug CLI + dev-only
  debug endpoint; frontend headless component render/dump). Built first so
  every later checkpoint has structured access to running state.
- **01-skeletons** — every page and every data-driven component gets a
  dedicated skeleton (loading) state.
- **02-frontend-decoupling** — move all non-JSX logic out of pages/components
  into pure, unit-tested modules (`lib/selectors/*`), keeping the UI layer thin
  and testable.
- **03-backend-separation** — ensure all business logic lives in services
  (controllers stay thin adapters); extract anything left inline and keep
  `npm test` green.