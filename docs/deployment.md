# Deploying to Vercel

SplitEase deploys as **two separate Vercel projects**: one for the Next.js
frontend and one for the Express backend. The repository is an npm workspaces
monorepo (`package.json` declares `frontend` and `backend`), so each project
points Vercel at its own workspace with a Root Directory.

There is deliberately **no `vercel.json` at the repository root**. A root config
with `services` plus a catch-all rewrite (`/(.*)`) makes Vercel route every
request to a service at the proxy layer, which breaks Next.js routing and fails
with `500 FUNCTION_INVOCATION_FAILED`. Next.js handles its own routes; do not
rewrite in front of it.

## Required project settings

| Project | Root Directory | Framework Preset |
| --- | --- | --- |
| Backend | `backend` | Express |
| Frontend | `frontend` | Next.js |

Set these under **Settings → General → Root Directory** and **Settings → Build
and Deployment → Framework Preset**. The Framework Preset must not be
`Services`; that preset requires a root `vercel.json`, which no longer exists.

`backend/vercel.json` pins the function entrypoint to a 60s max duration. It is
only read when the backend Root Directory is `backend`.

## Frontend environment variables

```
NEXT_PUBLIC_API_URL=https://<backend-domain>/api
```

This must be the backend's **absolute** URL. The two projects are on different
domains, so the relative `/api` used by a single-project Services setup will
not resolve. `NEXT_PUBLIC_*` values are inlined at build time, so changing this
requires a redeploy, not just a restart.

## Backend environment variables

```
NODE_ENV=production
CORS_ORIGIN=https://<frontend-domain>
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

`CORS_ORIGIN` must be the frontend domain, since the browser calls the backend
cross-origin. `RESEND_FROM_EMAIL` must be a verified sender in the Resend
account.

The backend validates all of the above at boot and reports **every** missing
variable in one error (`backend/src/config/env.js`), so a misconfigured deploy
takes one attempt to diagnose rather than one attempt per variable.

`PORT` and `NODE_ENV` are not worth setting: Vercel assigns the port and sets
`NODE_ENV=production` itself.

### Running without Resend

`RESEND_API_KEY` is optional. When unset, the server logs a warning at boot and
writes verification codes to the server logs instead of emailing them (`[email:log]`).
This lets deployments succeed immediately on Vercel even before setting up a
Resend account.

Search the Vercel runtime logs for `[email:log]` to read verification codes.
Once you configure `RESEND_API_KEY` under Settings > Environment Variables in
Vercel, emails will be delivered directly via Resend.

## Local verification

```bash
npm run dev
```

Runs the frontend and backend together via npm workspaces. To exercise the
Vercel routing itself, `vercel dev` requires authentication against the Vercel
Cloud and is no longer needed now that each project is configured separately.
