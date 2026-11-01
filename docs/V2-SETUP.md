# InsightPip 2.0 development setup

This is an integrated development revision of the existing Next.js application, based on `insightpip-v2-foundation`. Production and the Prisma schema were not changed. Use a dedicated development PostgreSQL database. This delivery is for evaluation, not a production release.

## Windows / PowerShell

Install Git, Node.js 22 LTS and PostgreSQL. Clone the repository and select `insightpip-v2-redesign` (or extract the source ZIP).

```powershell
git clone https://github.com/nsukuTechGeek888/insight-pip.git
cd insight-pip
git checkout insightpip-v2-redesign
$env:PUPPETEER_SKIP_DOWNLOAD = "1"
npm ci
Copy-Item .env.example .env
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
npm run prisma:generate
```

Edit `.env`: set `DATABASE_URL` to your separate development database and paste a newly generated random secret into `JWT_SECRET`. Generate a separate `NEXTAUTH_SECRET` for the retained NextAuth configuration. Never commit `.env`. Existing cookie authentication requires at least 32 characters in `JWT_SECRET`; it now fails closed instead of using a hardcoded fallback.

Restore a sanitized development database snapshot matching `prisma/schema.prisma`. No migration, reset or seed is required by this redesign. Do not run `db:setup`, `db:reset` or `prisma:seed` against any shared or production database. Database provisioning and a reviewed migration history are separate from this UI delivery.

```powershell
npm run dev
```

Open http://localhost:3000. Without a database, public layouts render and directories show explicit connection errors; provider records, authentication and admin operations require the development database. No mock data is substituted.

## Build and checks

```powershell
npm run prisma:generate
npm run typecheck
npm test
npm run lint
npm run build
npm start
```

Run `npm run test:smoke` in another terminal while the local application is running. Its default target is localhost:3000. For another local port:

```powershell
$env:TEST_BASE_URL = "http://localhost:3001"
npm run test:smoke
```

The smoke script rejects non-local targets and does not authenticate or create records. Full lint currently fails on inherited and remaining code issues; see `V2-DELIVERY.md`. A clean build does not imply all authenticated workflows have been tested.

## Architecture

`src/app/platform.css` owns shared semantic colors, responsive layouts, system light/dark appearance and reduced motion. `PlatformNav` and `ClientRootLayout` provide the common shell. New research views live in `src/components/research`; existing provider, authentication, editorial and administration components retain their data integrations and receive shared theme styling. Public discovery adapters under `/api/research` use the existing Prisma models. Comparison and visitor drafts use browser storage; they are not server-synced bookmarks.

The source ZIP excludes generated dependencies, secrets, git internals and user-upload directories. Restore approved public logos separately if your database references excluded uploads. Private evidence must never be restored under `public/`.
