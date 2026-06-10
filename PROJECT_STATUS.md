# AMBARA Project Status

## Current Progress
- Phase 2A backend foundation has started on top of the approved public frontend.
- Public frontend visual direction and existing public pages are preserved.
- Supabase client integration, role model, protected routes, dashboard shells, project schema, and setup docs have been added.
- Public `/lacak-proyek` can attempt real project lookup when Supabase is configured and falls back gracefully to the approved mock preview.
- Source has been published to GitHub branch `main`.

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
- Backend not fully implemented beyond Phase 2A shell/foundation.
- CMS not implemented.
- Payment gateway not implemented.
- Complex analytics not implemented.

## Remaining Features
- Configure Supabase project and Vercel environment variables.
- Run `supabase/schema.sql` and adapt `supabase/seed.sql` with real auth user IDs.
- Replace dashboard placeholder lists with live Supabase queries.
- Implement real create/update mutations for clients, projects, project updates, photos, and documents.
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
- Configure Supabase and Vercel environment variables, then implement Phase 2B: live dashboard data queries and project create/update actions.

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
