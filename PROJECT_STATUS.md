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
- Final frontend polish pass completed for public brand alignment, spacing, CTA hierarchy, and copy tone.
- Official AMBARA logo integration is prepared with safe header/footer logo detection; no official logo asset is currently present in `public/assets`.
- Brand alignment refined toward AMBARA's real custom interior, production, installation, residential, office, and cafe identity.
- Company profile YouTube video embedded on the public homepage and Tentang page.
- Backend/auth/RBAC/database logic unchanged during this visual polish pass.
- Vercel SPA routing fixed with `vercel.json` rewrites so direct React Router routes fall back to `index.html`.
- Direct routes like `/admin/login` and `/client/login` should now work after redeploy.
- Public `/lacak-proyek` can attempt real project lookup when Supabase is configured and falls back gracefully to the approved mock preview.
- Public `/lacak-proyek` no longer auto-loads `AMB-2026-001`; project data only appears after the user submits a code.
- Public `/lacak-proyek` result UI now has premium empty states for missing timeline updates, documents, and progress photos.
- Source is being published to GitHub branch `main`.

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
- Admin-managed client registration remains manual through Supabase Dashboard for now.
- Public header and footer brand presentation refined with a charcoal-forward AMBARA identity.
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
- Create/invite Supabase Auth users manually, then link client records through `clients.user_id`.
- Implement Supabase Storage upload flows.
- Add admin user management and invite flow.
- Add production security review for RLS policies.
- Later phase: CMS, richer admin dashboard, and full client portal polish.

## Known Issues
- The local machine does not have global `node`, `npm`, or `git` on PATH. A workspace-local portable Node runtime was used for install/build verification and is ignored by git in `.tools/`.
- The Codex in-app browser previously failed to connect in this Windows sandbox.
- `npm run build` succeeds but prints non-fatal React Router and Framer Motion warnings about ignored `"use client"` directives during bundling.
- The production JS bundle is above Vite's default 500 kB warning threshold after adding Supabase. This is a warning, not a build failure; route-level code splitting can be added later.

## Next Task
- Test the deployed homepage and Tentang page after Vercel redeploy, especially the company profile YouTube embed and future official logo asset placement.

## Exact Command To Run Locally
```bash
npm install
npm run dev
```

## Build Status
- Passed with `npm run build`.
- Output directory: `dist/`.
- Non-fatal warnings: React Router and Framer Motion `"use client"` directives, plus Vite chunk-size warning after adding Supabase.

## Local Preview Instructions
- Current preview URL: `http://127.0.0.1:5173/`.
- To run fresh locally, install Node.js, then run `npm install` and `npm run dev`.
- Open the local Vite URL shown in the terminal, typically `http://localhost:5173/` or `http://127.0.0.1:5173/`.
