# Deploying to Vercel

SplitEase deploys as a single Vercel project using **Services**: the Next.js
frontend and the Express backend are built separately and served from one
domain. `vercel.json` at the repository root is the source of truth for that
topology.

## Required project settings

Both conditions must hold or the build fails with
`Project framework is set to "services", but no services are declared`:

| Setting | Value | Where |
| --- | --- | --- |
| Root Directory | `/` (Repository Root) | Settings → General |
| Framework Preset | `Services` | Settings → Build and Deployment |

**Root Directory must be the repository root, not `frontend/` or `backend/`.**
Vercel resolves `vercel.json` relative to the Root Directory, so a subdirectory
setting makes the root `vercel.json` invisible and every service is dropped.

Services is a Vercel beta and is permission-gated per account. If the Services
preset is unavailable, deploy the frontend and backend as two separate projects
instead and set `NEXT_PUBLIC_API_URL` to the backend's absolute URL.

## Routing

`vercel.json` routes `/api/*` to the backend and everything else to the
frontend. A service receives the **original** request path, so the backend is
mounted under `/api` because that is where `backend/src/app.js` registers its
routes. Do not add a prefix such as `/api/backend` in the rewrite source.

## Environment variables

Set `NEXT_PUBLIC_API_URL=/api` (relative, same domain). Backend variables are
shared with the frontend service because Services projects share one env scope.

```
NEXT_PUBLIC_API_URL=/api

NODE_ENV=production
CORS_ORIGIN=https://<your-domain>
DB_HOST=ep-tiny-feather-b5itww1l-pooler.c-7.us-east-2.aws.neon.tech
DB_PORT=5432
DB_NAME=neondb
DB_USER=neondb_owner
DB_PASSWORD=<neon password>
JWT_SECRET=<random 32+ byte secret>
JWT_EXPIRES_IN=7d
RESEND_API_KEY=<resend api key>
RESEND_FROM_EMAIL=SplitEase <onboarding@resend.dev>
OTP_TTL_MINUTES=10
```

The backend refuses to boot in production without `JWT_SECRET`,
`RESEND_API_KEY`, and `CORS_ORIGIN` (`backend/src/config/env.js`).

## Local verification

```bash
vercel dev -L
```

Runs every service locally from the same `vercel.json` without authenticating
against the Vercel Cloud, which is the fastest way to catch a routing mistake
before deploying.
