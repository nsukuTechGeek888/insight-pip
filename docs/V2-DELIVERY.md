# InsightPip 2.0 evaluation delivery

## Implemented in this revision

- Shared navy/blue design tokens, intentional light and dark CSS themes driven by `prefers-color-scheme`, responsive navigation and reduced-motion support.
- New responsive homepage, broker/prop-firm directories, global search, review and incident hubs, visitor review/incident composer, comparison workspace, offers directory and transparency page.
- Provider discovery uses real active records, region restrictions, search, sorting and server pagination. Missing values remain unknown. Connection failures remain visible.
- Three-provider same-type comparisons, browser persistence, shareable query URLs, difference highlighting, and account/program data using existing models.
- Review drafts survive reloads before sign-in. Submission uses existing APIs and enters moderation; email confirmation is not presented as verified trading experience.
- Shared trader/admin workspace navigation and database-counted admin summary metrics. Existing provider editing, moderation, profiles, articles and authentication routes are retained and restyled.
- In-app feedback/confirmation dialogs replace native alert/confirm/prompt calls.
- Strict TypeScript production build restored; schema mismatches and missing imports fixed. Strong session secrets required. New public-list moderation/privacy filtering and authenticated report endpoint.

## Verification

- Prisma client generation: passed.
- TypeScript and production build: passed with build-time type checking enabled (latest check recorded in delivery).
- Focused ESLint on new research components, navigation, dialogs and research API routes: 0 errors, 2 warnings (image optimization and an initial-state effect dependency).
- Unit tests: 3 passed (session secret requirements, region restriction precedence, entity mapping).
- Browser: desktop homepage and reviews rendered; navigation into review composer rendered; visitor title/content recovered after reload; custom clear-draft confirmation worked. Database unavailable state displayed correctly.
- Repository lint: failed, 2,098 findings (1,982 errors / 116 warnings in the earlier full run), primarily existing `any` and unused-code issues. It is not a clean lint baseline. Build retains the repository's lint-skip setting; it does not skip TypeScript.
- HTTP smoke suite added but not completed in this environment: the managed preview is browser-accessible, while direct Node requests failed with a socket/network error. Run locally using the setup instructions.
- Not verified: real database records, login/session lifecycle, admin mutations, moderation submissions, uploads, full keyboard/screen-reader audit, mobile/tablet screenshots, or runtime system-theme switching. CSS supports these layouts/themes, but support is not a substitute for device testing.

## Outstanding work / Thursday data milestone

1. Reconcile review aggregates, Trust Scores and incidents. Existing calculations and cached fields are inconsistent; establish one documented methodology, moderation eligibility rules, backfill strategy and tests. No score backfill or schema migration ran in this revision.
2. Provision sanitized development data and test real broker/firm profiles, program/account variants, regional restrictions, search and comparison end to end. Audit legacy profile defaults and regulatory/source claims; the new discovery views do not invent missing values.
3. Implement private evidence storage with authenticated retrieval, content/type/size validation, malware policy and retention. Legacy upload paths need a security audit before release. The new composer explicitly does not offer evidence upload.
4. Implement actual suspension state and enforce it in session authorization. Existing suspension action was a no-op; it now returns an explicit unsupported response instead of claiming success. Add schema changes only through reviewed migrations.
5. Finish password reset/email verification, notifications, cloud-saved providers/comparisons, moderation appeals and comprehensive audit trails. Existing auth/profile routes are retained, not a claim that all requested account capabilities exist.
6. Complete provider-source verification metadata and editorial management. Offers are presented with unconfirmed source verification; structured expiry is filtered, ambiguous dates remain unconfirmed. Existing content and provider CRUD remain in place.
7. Finish full profile/editor/admin visual audit using realistic development records, especially responsive long forms, date/time controls and complex tables. Existing screens are integrated and themed but not all rebuilt or individually verified.
8. Resolve the lint backlog, audit rate limiting/CSRF/upload authorization throughout legacy endpoints and run authenticated regression tests before any deployment.

This is a substantial working redesign revision, not completion of every item in the 22-section specification. No production deployment or merge was performed. The production branch, database schema and production data were not changed.
