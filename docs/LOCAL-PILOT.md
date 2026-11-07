# Run the founding reviewer pilot on Windows

Open PowerShell in the extracted folder containing package.json. Use Node.js 22.17 or newer.

~~~powershell
$env:PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = "true"
npm ci
npm run prisma:generate
npm run dev:research
~~~

Open http://127.0.0.1:3000 on this computer. The research workspace binds to the loopback address. Read the editor login locally in a second PowerShell window with `Get-Content .private/research/access.json`. Keep that file private. Development email is saved locally, so this mode cannot independently verify a remote person's email by inbox delivery.

## Provider coverage

The first start creates unpublished Pepperstone and FTMO records with dated official sources, two broker account types and one evaluation. Review the sources, local entity, fees, eligibility and visible fields in Admin before publishing a profile locally. Additional firms can be added through Admin → Brokers or Prop Firms → Import. Use the downloadable JSON templates and record official sources in the research editor. Prioritize the providers that pilot participants actually used.

Stop the app with Ctrl+C before copying the complete .private/research folder to a private backup. Restore it into the same relative location when updating the source. It contains the local database, login file and uploaded material. Before a hosted beta, rehearse a controlled transfer into staging and compare provider, user, review, moderation and evidence records. A source-code download contains none of this private data.

## Recruit through Simple Trading Concepts

Post: “Which broker or prop firm have you actually traded with? I’m building InsightPip so traders can read what happened to someone else before opening an account or paying for a challenge. I’m looking for our first 10 reviewers. If you’ve used one yourself, DM me PIP and the provider’s name. Good, mixed and bad experiences are all welcome.”

DM reply: “Thanks! Which account or challenge did you use, roughly when, and what’s one detail another trader should know? Would you like an invite to write your own review before we open to the public?”

For remote volunteers who want to write now, ask for an optional private draft: provider, account or challenge, approximate month, rating out of five and their own words. Tell them who can read the draft and ask whether you may keep it until their invitation. Avoid collecting account numbers, logins, trade statements or payment screenshots in DMs. Let them confirm and submit their final wording under their own account in the private beta.

For in-person volunteers, let each person create and use their own account on the research laptop and sign out afterwards. The admin reviews submissions in the existing queue. Local email previews do not prove email ownership. Use the same moderation criteria for all ratings. Keep affiliation disclosures alongside the submission and use the private evidence workflow only when necessary.

Track progress privately with one row per person: contact handle, provider, account type, permission to follow up, draft received, submitted, moderation decision. Record an invitation separately from a completed review. Keep the tracker outside Git. Aim for 15–20 volunteers to allow for drop-off; the actual launch target is 10 approved reviews from 10 distinct people. Check the staged provider pages, published counts, moderation state and private evidence access before the public launch. Permission to publish a platform review is separate from permission to quote someone in marketing.
