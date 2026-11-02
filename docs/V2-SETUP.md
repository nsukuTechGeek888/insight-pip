# Evaluate InsightPip on Windows

Use Node.js 22.17 or newer. Extract the source and open PowerShell in the folder containing package.json.

~~~powershell
$env:PUPPETEER_SKIP_DOWNLOAD = "1"
npm ci
npm run prisma:generate
npm run dev:qa
~~~

Open http://localhost:3000. QA mode creates an isolated local database with clearly labelled fictional providers and submissions. Read the generated trader and admin credentials locally with `Get-Content .private/qa/access.json`. Development emails appear in .private/mail. Keep these directories private.

To evaluate the workflow, compare two providers, choose a specific offering, save it as the trader, submit a review with evidence, then use the administrator account to inspect it and record a decision. Check the trader's notifications afterwards.

For ordinary development, copy .env.example to .env and configure a separate PostgreSQL DATABASE_URL, JWT_SECRET and NEXTAUTH_SECRET. Generate independent secrets with Node's crypto.randomBytes(48).toString('hex'). Apply the new additive platform_services and homepage_content migrations to a development database matching the previous foundation schema. Check migration history before applying any earlier migrations. Use npm run dev.

Configure APP_URL, SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD and MAIL_FROM for real email delivery. Configure PRIVATE_STORAGE_DIR on persistent storage outside public/. The web process needs write access to it and to the public image upload directories.

Run npm test, npm run typecheck, npm run lint and npm run build. Run npm start to serve the production build locally. Run npm run test:smoke against a running local server.
