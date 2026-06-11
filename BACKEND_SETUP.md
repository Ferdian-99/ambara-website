# AMBARA Backend Setup

Phase 2A added the Supabase foundation for authentication, roles, protected dashboard routes, and project tracking data. Phase 2B connects the admin and client dashboards to live Supabase project data. The public website remains unchanged.

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

For a client to log in:

1. Create or invite the client user in Supabase Authentication.
2. Create a matching `public.profiles` row with role `client`.
3. Copy the Auth user UID.
4. Open `/admin/clients`.
5. Paste the UID into `Supabase User UID` for the matching client record.
6. Save the UID so `clients.user_id` points to that Auth user.

The admin clients page shows portal status for each client:

- `Portal aktif`: `clients.user_id` is linked.
- `Belum terhubung`: no Auth user UID is linked yet.
- `Email available`: the client record has an email that can be used for manual invitation.
- `Missing email`: add an email before preparing a portal account.

Do not use a Supabase `service_role` key in the frontend. Creating/inviting Auth users remains manual through Supabase Dashboard for now.

## Password Reset Setup

The app includes:

- `/forgot-password`: sends Supabase reset password email.
- `/update-password`: accepts the reset session and saves the new password.

In Supabase Dashboard, open:

Authentication -> URL Configuration

Add these redirect URLs:

```text
https://ambara-website.vercel.app/update-password
http://localhost:5173/update-password
```

Password reset emails also require Supabase email settings/templates to be configured for the project.

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
