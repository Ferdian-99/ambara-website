# AMBARA Project Status

## Current Progress
- Phase 2B backend dashboard functionality has started on top of the approved public frontend.
- Public frontend visual direction and existing public pages are preserved.
- Supabase client integration, role model, protected routes, dashboard shells, project schema, and setup docs have been added.
- Admin and client dashboards now use live Supabase data for projects, clients, project timeline updates, documents, and photos.
- Admin project create and project progress update actions are now connected to Supabase.
- Client dashboard now only shows projects linked to the authenticated user's client record.
- Unified `/login` portal route added for admin, internal team, and client users.
- Public navigation now includes a subtle `Portal` entry that points to `/login`.
- `/admin/login` and `/client/login` are preserved and redirect to the unified login route.
- Client/admin onboarding flow improved: `/admin/clients` now shows portal account status and supports manual Supabase User UID linking.
- Password recovery routes added at `/forgot-password` and `/update-password`.
- Phase 2C client invitation flow added: `/admin/clients` can send `Kirim Undangan Portal` through the `invite-client` Supabase Edge Function when deployed.
- `invite-client` Edge Function source added with server-side Supabase Admin Auth usage and `service_role` kept out of Vite/browser code.
- `invite-client` now builds invite/reset redirects from `SITE_URL + /update-password`, with production fallback to `https://ambara-website.vercel.app`.
- Manual Supabase User UID linking remains available as a fallback if the Edge Function is not deployed.
- `/admin/clients` invitation UI refined so normal admins see clear portal status and invite actions first, while manual Supabase User UID linking is tucked into an advanced fallback section.
- `/admin/clients` now uses `Undangan terkirim` for linked invited accounts instead of implying the portal is already active before acceptance is tracked.
- Client portal activation tracking added with `clients.portal_activated_at`.
- `/update-password` now marks the linked client record as activated after a successful password update.
- Client dashboard/project access also marks older linked client accounts active as a fallback when `portal_activated_at` is still empty.
- `/admin/clients` now distinguishes `Belum terhubung`, `Undangan terkirim`, `Email belum tersedia`, and `Portal aktif` based on email, `user_id`, and `portal_activated_at`.
- `/admin/clients` UI polished into more compact client cards with short portal status badges and no long helper descriptions.
- Visible per-card `Advanced: Manual UID Linking` controls were removed from normal admin workflow now that email invitations and activation tracking are working.
- Phase 2C Storage upload foundation added for project documents and progress photos.
- `/admin/projects/:id` now allows `super_admin` and `project_manager` to upload project documents and progress photos through Supabase Storage.
- Uploaded document metadata is saved to `project_documents`; uploaded photo metadata is saved to `project_photos`.
- `/client/projects/:id` and public `/lacak-proyek` continue to display uploaded documents/photos read-only from the same real Supabase records.
- `/admin/clients` client card layout spacing refined so the portal status panel no longer overlaps email, phone, or address text.
- Client multi-project visibility remains based on `auth.users.id -> clients.user_id -> clients.id -> projects.client_id`, so one linked client account can see all assigned projects.
- Final frontend polish pass completed for public brand alignment, spacing, CTA hierarchy, and copy tone.
- Official AMBARA logo integration fixed: public header/navbar uses `/assets/ambara-logo-dark-v2.png`, and footer/dark usage uses `/assets/ambara-logo-light.png`.
- Header logo sizing increased for clearer readability while preserving object-contain rendering and balanced navbar spacing.
- Brand alignment refined toward AMBARA's real custom interior, production, installation, residential, office, and cafe identity.
- Company profile YouTube video embedded on the public homepage and Tentang page.
- Backend/auth/RBAC/database logic unchanged during this visual polish pass.
- Vercel SPA routing fixed with `vercel.json` rewrites so direct React Router routes fall back to `index.html`.
- Direct routes like `/admin/login` and `/client/login` should now work after redeploy.
- Public `/lacak-proyek` can attempt real project lookup when Supabase is configured and falls back gracefully to the approved mock preview.
- Public `/lacak-proyek` no longer auto-loads `AMB-2026-001`; project data only appears after the user submits a code.
- Public `/lacak-proyek` result UI now has premium empty states for missing timeline updates, documents, and progress photos.
- Final frontend polish source has been published to GitHub branch `main`.

## Completed Features
- Vite + React + TypeScript + Tailwind CSS + Framer Motion stack retained.
- React Router retained for public pages and expanded for protected admin/client routes.
- Existing public routes preserved: `/`, `/tentang`, `/layanan`, `/portofolio`, `/proses`, `/lacak-proyek`, `/kontak`.
- Supabase dependency added for Auth, Database, Storage, and RLS integration.
- `src/lib/supabase.ts` added with typed database model and env-safe client initialization.
- `src/lib/auth.ts` added for login, logout, session lookup, and profile role resolution.
- `src/lib/rbac.ts` added for roles and frontend permission helpers.
- `src/routes/ProtectedRoute.tsx` added for protected route checks and role-based access.
- Admin login route added at `/admin/login`.
- Unified public login route added at `/login` with role-based redirects.
- Admin dashboard shell added at `/admin`.
- Admin routes added: `/admin/projects`, `/admin/projects/new`, `/admin/projects/:id`, `/admin/clients`, `/admin/documents`.
- Client login route added at `/client/login`.
- Client dashboard shell added at `/client`.
- Client routes added: `/client/projects`, `/client/projects/:id`.
- Project tracking schema added for profiles, clients, projects, project updates, documents, and photos.
- Row Level Security policies added in `supabase/schema.sql`.
- Seed template added in `supabase/seed.sql`.
- Environment example added in `.env.example`.
- Backend setup guide added in `BACKEND_SETUP.md`.
- `/lacak-proyek` manual search behavior added with premium idle, not-found, and graceful fallback states.
- `/lacak-proyek` empty related-data sections refined with editorial placeholders that do not fake Supabase records.
- Shared Supabase data access helper added for dashboard project/client queries and mutations.
- `/admin` overview now loads live project, client, and recent update data.
- `/admin/projects` now lists real project records from Supabase.
- `/admin/projects/new` now creates real project records and assigns them to client records.
- `/admin/projects/:id` now shows real project detail, timeline, documents, and photos.
- `/admin/projects/:id` now allows permitted admin roles to add project timeline updates and update current project stage/progress.
- `/admin/clients` now lists and creates real client records, with optional auth profile linking.
- `/client` and `/client/projects` now show only projects assigned to the authenticated client user.
- `/client/projects/:id` now shows read-only live project status, timeline, documents, and photos for the authenticated client.
- Vercel SPA fallback routing added for production deep links.
- Login now redirects `super_admin`, `project_manager`, `sales`, and `content_manager` to `/admin`, and `client` to `/client`.
- Missing profiles show a clear configuration error after authentication.
- Invalid credentials show a user-friendly login error.
- `/admin/clients` now clarifies that client records are not automatically login accounts.
- `/admin/clients` now shows account states: portal active, not linked, email available, and missing email.
- Admin users with client permissions can manually save `clients.user_id` using the Supabase User UID from Supabase Authentication.
- Forgot password flow added using Supabase password reset email.
- Update password flow added for reset links that return to `/update-password`.
- Admin-managed client invitation flow added with `Kirim Undangan Portal` action on `/admin/clients`.
- Supabase Edge Function source added at `supabase/functions/invite-client/index.ts`.
- Invitation flow can create/invite a client auth user, upsert the client profile role, and link `clients.user_id` when the Edge Function is deployed.
- Invitation redirect behavior documented for Supabase `SITE_URL`, Auth URL Configuration, redirect URLs, and the Invite user email template.
- Client portal activation migration added for `clients.portal_activated_at`.
- `Portal aktif` is now shown only after `portal_activated_at` is set by the password update flow or client dashboard fallback.
- Supabase Storage migration added for `project-documents` and `project-photos` buckets.
- Admin document upload added with category support: Quotation, Desain Final, Invoice, Kontrak, and Lainnya.
- Admin progress photo upload added with caption support.
- Upload validation added for supported file types and size limits.
- `/admin/clients` now has invitation loading, success, and error states.
- `/admin/clients` client cards now prioritize client name, email, phone, address, portal status, and contextual invitation guidance.
- `/admin/clients` client cards now use compact uppercase portal badges and show `Kirim Undangan Portal` only where an unlinked client has an email.
- `/admin/clients` client cards now stack safely on narrower dashboard widths and use a bounded two-column layout on wide desktop screens.
- `Kirim Undangan Portal` now appears only for unlinked clients with an email, while missing-email clients see a disabled invite action and helper copy.
- Manual Supabase User UID helpers remain in the data layer for operational fallback, but the visible per-card advanced linking UI is no longer shown to normal admins.
- Public header and footer brand presentation refined with a charcoal-forward AMBARA identity.
- Official logo presentation adjusted for desktop and mobile navbar readability.
- Public homepage and Tentang copy refined toward custom interior, built-in furniture, workshop production, and installation.
- Company profile video section added with a responsive YouTube embed.
- Backend file upload UI remains informational only; real upload is not implemented yet.
- CMS not implemented.
- Payment gateway not implemented.
- Complex analytics not implemented.

## Remaining Features
- Run `supabase/schema.sql` and adapt `supabase/seed.sql` with real auth user IDs if not already done.
- Test admin/client dashboard flows with real Supabase roles and RLS.
- Configure Supabase password reset redirect URLs for production and local development.
- In Supabase Auth URL Configuration, set Site URL to `https://ambara-website.vercel.app` and add the production/local wildcard redirect URLs documented in `BACKEND_SETUP.md`.
- Deploy and configure the `invite-client` Supabase Edge Function for production invitations.
- Run the client portal activation migration in Supabase if the production database does not yet have `clients.portal_activated_at`.
- Run the Storage bucket/policy migration in Supabase if the production project does not yet have upload-ready buckets.
- If the Edge Function is not deployed, create/invite Supabase Auth users manually, then link client records through `clients.user_id`.
- Decide whether production documents should remain public MVP URLs or move to private buckets with signed URLs.
- Add admin user management and invite flow.
- Add production security review for RLS policies.
- Later phase: CMS, richer admin dashboard, and full client portal polish.

## Known Issues
- The local machine does not have global `node`, `npm`, or `git` on PATH. A workspace-local portable Node runtime was used for install/build verification and is ignored by git in `.tools/`.
- The Codex in-app browser previously failed to connect in this Windows sandbox.
- `npm run build` succeeds but prints non-fatal React Router and Framer Motion warnings about ignored `"use client"` directives during bundling.
- The production JS bundle is above Vite's default 500 kB warning threshold after adding Supabase. This is a warning, not a build failure; route-level code splitting can be added later.

## Next Task
- Run `supabase/migrations/20260612010000_add_project_storage_buckets.sql` in Supabase, then upload one test document and one test progress photo from `/admin/projects/:id`.

## Exact Command To Run Locally
```bash
npm install
npm run dev
```

## Build Status
- Passed with `npm run build` after the compact `/admin/clients` UI polish.
- Output directory: `dist/`.
- Non-fatal warnings: React Router and Framer Motion `"use client"` directives, plus Vite chunk-size warning after adding Supabase.

## Local Preview Instructions
- Current preview URL: `http://127.0.0.1:5173/`.
- To run fresh locally, install Node.js, then run `npm install` and `npm run dev`.
- Open the local Vite URL shown in the terminal, typically `http://localhost:5173/` or `http://127.0.0.1:5173/`.
