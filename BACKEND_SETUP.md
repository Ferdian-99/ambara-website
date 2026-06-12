# AMBARA Backend Setup

Phase 2A added the Supabase foundation for authentication, roles, protected dashboard routes, and project tracking data. Phase 2B connects the admin and client dashboards to live Supabase project data. Phase 2C adds a deployable admin-managed client invitation Edge Function while keeping the public website unchanged.

## Supabase Setup

1. Create a new Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Create Storage buckets if they were not created by SQL:
   - `project-documents`
   - `project-photos`
4. Create auth users in Supabase Authentication.
5. Copy their user IDs into `supabase/seed.sql`, replacing the placeholder UUIDs.
6. Run `supabase/seed.sql`.

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Only use the Supabase anon public key in Vite. Do not place service role keys in the frontend.

## Create First Super Admin

1. In Supabase Authentication, create an internal AMBARA user.
2. Copy the generated auth user ID.
3. Insert a row into `public.profiles`:

```sql
insert into public.profiles (id, full_name, email, role, phone)
values (
  'AUTH_USER_ID_HERE',
  'AMBARA Super Admin',
  'admin@example.com',
  'super_admin',
  '+62 800 0000 0000'
);
```

## Roles

- `super_admin`: full access.
- `project_manager`: manage projects, progress updates, photos, and documents.
- `sales`: create clients and project/order records, view status.
- `content_manager`: dashboard access only for future CMS.
- `client`: view only their own project data.

## Local Run

```bash
npm install
npm run dev
```

Then open the Vite URL, usually `http://localhost:5173/`.

## Login Flow

- Public login route: `/login`.
- The public navigation includes `Portal`, which links to `/login`.
- Existing `/admin/login` and `/client/login` URLs are preserved and redirect to `/login`.
- After login, users are redirected by profile role:
  - `super_admin`, `project_manager`, `sales`, and `content_manager` go to `/admin`.
  - `client` goes to `/client`.
- If authentication succeeds but no `profiles` row is configured, the app shows: `Akun berhasil masuk, tetapi profil belum dikonfigurasi. Hubungi tim Ambara.`
- If credentials are invalid, the app shows: `Email atau password tidak sesuai.`

## Client Account Linking

A row in `public.clients` stores project/client information only. It does not automatically create a login account.

Preferred invitation flow after deploying the Edge Function:

1. Create a client record in `/admin/clients`.
2. Click `Kirim Undangan Portal`.
3. The Edge Function invites or password-reset-links the client email through Supabase Auth.
4. The function upserts `public.profiles` with `role = client`.
5. The function links `clients.user_id` to the Auth User UID.
6. The client opens the email link, lands on `/update-password`, sets a password, then logs in at `/login`.
7. After the password is set, the app marks the linked client row as activated through `portal_activated_at`.

Manual fallback if the Edge Function is not deployed:

1. Create or invite the client user in Supabase Authentication.
2. Create a matching `public.profiles` row with role `client`.
3. Copy the Auth user UID.
4. Open `/admin/clients`.
5. Paste the UID into `Supabase User UID` for the matching client record.
6. Save the UID so `clients.user_id` points to that Auth user.

The admin clients page shows portal status for each client:

- `Belum terhubung`: no Auth user UID is linked yet.
- `Undangan terkirim`: `clients.user_id` is linked, but `portal_activated_at` is still empty.
- `Portal aktif`: the client has set a password or reached the client dashboard, and `portal_activated_at` has been filled.
- `Email belum tersedia`: add an email before preparing a portal account.

Portal lifecycle:

```text
Belum terhubung -> Undangan terkirim -> Portal aktif
```

Do not use a Supabase `service_role` key in the frontend. The service role key belongs only in the Supabase Edge Function environment.

## Client Portal Activation Migration

Existing Supabase projects should run this migration before relying on the active portal status:

```sql
alter table public.clients
add column if not exists portal_activated_at timestamptz;
```

The repository includes the full migration at:

```text
supabase/migrations/20260612000000_add_client_portal_activation.sql
```

The migration also creates `public.mark_own_client_portal_active()`, a narrow authenticated RPC used by the frontend after `/update-password` succeeds and as a fallback when a client dashboard loads. It only updates client rows where `clients.user_id = auth.uid()`.

## Client Invitation Edge Function

Function source:

```text
supabase/functions/invite-client/index.ts
```

Deploy with Supabase CLI:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set SUPABASE_URL=https://your-project-ref.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
supabase secrets set SITE_URL=https://ambara-website.vercel.app
supabase functions deploy invite-client
```

`SITE_URL` controls the invitation redirect target. The function sends invite and reset links to:

```text
SITE_URL + /update-password
```

If `SITE_URL` is missing, the function falls back to:

```text
https://ambara-website.vercel.app
```

For local Edge Function testing, set `SITE_URL` to:

```bash
supabase secrets set SITE_URL=http://localhost:5173
```

Required Edge Function environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SITE_URL`

The `invite-client` function:

- Accepts `client_id`.
- Verifies the logged-in admin JWT from the request.
- Allows only `super_admin` and `sales` profiles to send invitations.
- Reads the client record.
- Sends a Supabase Auth invite for a new email, or a password reset email if the Auth user already exists.
- Upserts `public.profiles` with `role = client`.
- Updates `clients.user_id` with the Auth User UID.

If the Edge Function is not deployed, `/admin/clients` still supports the existing manual `Supabase User UID` linking flow.

## Client Multi-Project Assignment

A client can have multiple projects. The important relationship is:

```text
auth.users.id -> clients.user_id -> clients.id -> projects.client_id
```

Example:

```text
clients.id = client_001
clients.user_id = auth user UID

AMB-2026-001 -> projects.client_id = client_001
AMB-2026-002 -> projects.client_id = client_001
```

When that client logs in, `/client`, `/client/projects`, and `/client/projects/:id` load all projects assigned to the linked `clients.id`. Projects assigned to another client record remain hidden by the frontend query and Supabase RLS.

## Password Reset Setup

The app includes:

- `/forgot-password`: sends Supabase reset password email.
- `/update-password`: accepts the reset session and saves the new password.

In Supabase Dashboard, open:

Authentication -> URL Configuration

Set Site URL:

```text
https://ambara-website.vercel.app
```

Add these redirect URLs:

```text
https://ambara-website.vercel.app/update-password
https://ambara-website.vercel.app/**
http://localhost:5173/update-password
http://localhost:5173/**
```

Password reset emails also require Supabase email settings/templates to be configured for the project.

Invitation emails from `invite-client` also redirect to `/update-password`. Use production `SITE_URL=https://ambara-website.vercel.app` for deployed invitations and local `SITE_URL=http://localhost:5173` while testing locally.

## Supabase Invite Email Template

In Supabase Dashboard, open:

Authentication -> Email Templates -> Invite user

The default Supabase invitation email can be customized there. Keep the invitation link based on Supabase's confirmation/action URL variable so the `redirectTo` value from `invite-client` is respected. Avoid hardcoded localhost URLs in the template.

## Completed In Phase 2A

- Supabase client integration.
- Environment variable setup.
- Auth helpers and session checks.
- Role model and frontend RBAC helpers.
- Protected admin/client routes.
- Admin login page.
- Client login page.
- Admin dashboard shell.
- Client dashboard shell.
- Project schema, RLS policies, and seed file.
- Public `/lacak-proyek` can read real project data when Supabase is configured, with mock fallback when it is not.

## Completed In Phase 2B

- Admin overview loads live project, client, and recent update data.
- Admin project list loads real project records from Supabase.
- Admin project creation writes to the `projects` table and assigns a `client_id`.
- Admin project detail loads real project summary, timeline updates, documents, and photos.
- Permitted admin roles can add progress updates through `project_updates`.
- Progress updates also refresh `projects.current_stage`, `projects.progress_percentage`, and `projects.updated_at`.
- Admin clients page loads real clients and can create client records.
- Client records can optionally link to an existing auth profile through `clients.user_id`.
- Client dashboard and project pages only request projects linked to the authenticated user's client record.
- Client project detail is read-only and displays status, timeline, documents, and photos when available.

## Completed In Phase 2C

- `invite-client` Supabase Edge Function source added.
- Admin clients page can call the Edge Function with `Kirim Undangan Portal`.
- Invitation success/error/loading states added.
- Existing manual Supabase User UID linking remains available.
- Client dashboard multi-project visibility confirmed through `auth user id -> clients.user_id -> clients.id -> projects.client_id`.

## Role Notes For Phase 2B

- `super_admin`: can view and manage projects, clients, and updates.
- `project_manager`: can create/manage projects and add project updates.
- `sales`: can create clients and project records, and view project status.
- `content_manager`: can access the admin dashboard placeholder only; CMS remains future scope.
- `client`: can access only client routes and view linked project data.

## Remaining After Phase 2B

- Implement Supabase Storage upload flows.
- Add complete admin user management.
- Add stronger production RLS review and security test pass.
- Add CMS in a later phase.
- Add deployment environment variables in Vercel.
