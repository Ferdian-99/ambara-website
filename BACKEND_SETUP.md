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

## Archive Safety Migration

Phase 2E adds soft archive fields so clients and projects can be removed from active views without permanent data loss.

Run this migration after the previous dashboard/storage migrations:

```text
supabase/migrations/20260612050000_add_archive_fields.sql
```

It adds:

- `clients.archived_at`
- `projects.archived_at`
- `projects.budget_range`

Archive behavior:

- Active admin lists show records where `archived_at is null`.
- Archive tabs show records where `archived_at is not null`.
- Client portal project lists only show active projects.
- Public `/lacak-proyek` only searches active projects.
- Archiving never deletes Supabase Auth users, profiles, project updates, documents, photos, or project history.

Client archive safety:

- Only `super_admin` can archive or restore clients.
- The app blocks client archive if the client still has active projects.
- A database trigger also blocks non-`super_admin` changes to `clients.archived_at`.

Project archive safety:

- `super_admin` and `project_manager` can archive or restore projects.
- Archived projects remain available in the admin archive filter for review or restore.

## Portfolio CMS Setup

Phase 3A adds CMS-managed public portfolio items.

Run this migration after the previous migrations:

```text
supabase/migrations/20260612060000_add_portfolio_cms.sql
```

It creates:

- `public.portfolio_items`
- Storage bucket `portfolio-images`
- Public read policies for published, active portfolio items
- Admin policies for `super_admin` and `content_manager`
- A guard so only `super_admin` can archive or restore portfolio items
- Sample portfolio rows for Residensi Senja, Villa Aksara, and Studio Nara using `on conflict do nothing`

For this MVP, `portfolio-images` is a public bucket because portfolio media is marketing content. Production recommendation:

- Upload optimized JPG/WEBP images sized for web use.
- Keep only public marketing assets in `portfolio-images`.
- Avoid uploading private client documents, invoices, or sensitive project files into this bucket.

Public access:

- `/portofolio` reads published portfolio items where `published_at is not null` and `archived_at is null`.
- `/portofolio/:slug` reads one published portfolio item by slug.
- If Supabase is unavailable or no CMS data exists, the public pages keep the existing static fallback content.

Admin access:

- `/admin/portfolio` is available to `super_admin` and `content_manager`.
- `super_admin` and `content_manager` can create, edit, publish, and unpublish portfolio items.
- Only `super_admin` can archive or restore portfolio items.

## Project Storage Setup

Phase 2C adds Supabase Storage upload for project documents and progress photos.

Run this migration after the base schema:

```text
supabase/migrations/20260612010000_add_project_storage_buckets.sql
```

Run this follow-up migration when enabling delete actions from the admin project detail page:

```text
supabase/migrations/20260612020000_add_project_delete_policies.sql
```

If photo/document deletes return success but records still appear after refresh, also run the hardened delete policy migration:

```text
supabase/migrations/20260612030000_fix_project_delete_policies.sql
```

It creates or updates these buckets:

- `project-documents`
- `project-photos`

MVP bucket settings:

- `project-documents`: public bucket, max file size 10 MB.
- `project-photos`: public bucket, max file size 8 MB.
- Admin uploads use the logged-in Supabase session, never a service role key.
- Upload policies allow only users where `public.can_manage_projects()` is true, currently `super_admin` and `project_manager`.
- Delete policies allow only authenticated `super_admin` and `project_manager` profiles to remove timeline updates, document/photo metadata, and Storage objects from the two project buckets.
- Public read policies are included because the app stores direct public URLs in `project_documents.file_url` and `project_photos.image_url`.

Recommended file types:

- Documents: PDF, DOC, DOCX, JPG, PNG.
- Photos: JPG, JPEG, PNG, WEBP.

Dashboard setup alternative:

1. Open Supabase Dashboard -> Storage.
2. Create bucket `project-documents`.
3. Create bucket `project-photos`.
4. For this MVP, set both buckets to public if you want the existing direct file URLs to work immediately.
5. Add Storage policies equivalent to the migration so only `super_admin` and `project_manager` can upload.

Production recommendation:

- Use private buckets for sensitive quotations, invoices, contracts, and design files.
- Replace public URLs with signed URLs generated server-side or through a controlled Edge Function.
- Keep `SUPABASE_SERVICE_ROLE_KEY` only in server/Edge Function environments.

Storage delete behavior:

- `/admin/projects/:id` removes the metadata record first, then attempts to delete the related Storage object.
- If Storage removal fails but metadata deletion succeeds, the document/photo disappears from admin, client dashboard, and public tracking lists; the app shows a non-blocking warning so the orphaned object can be checked in Supabase Storage if needed.
- The frontend verifies that the metadata delete actually removed one row. If RLS blocks the delete, the admin UI now shows the Supabase/RLS error instead of showing a false success message.

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
- Supabase Storage upload helpers added for project documents and progress photos.
- Admin project detail can upload documents to `project-documents` and save metadata in `project_documents`.
- Admin project detail can upload progress photos to `project-photos` and save metadata in `project_photos`.
- Client dashboard and public project tracking display uploaded file records read-only.

## Completed In Phase 2D

- Admin project detail layout polished for daily operations with clearer project header, progress management, timeline, documents, and progress photo sections.
- `super_admin` and `project_manager` can delete project timeline updates.
- `super_admin` and `project_manager` can delete project document metadata and attempt Storage object cleanup from `project-documents`.
- `super_admin` and `project_manager` can delete progress photo metadata and attempt Storage object cleanup from `project-photos`.
- Delete policy migration added for timeline updates, document/photo metadata, and Storage objects.

## Completed In Phase 2E

- Archive fields added for clients and projects.
- Admin clients can be edited by permitted roles without exposing manual UID linking.
- Super admin can archive/restore clients, with active-project protection.
- Admin projects can be edited, archived, and restored by manager roles.
- Admin client/project lists now default to active records and include archive filters.
- Client portal and public tracking hide archived projects.

## Completed In Phase 3A

- Portfolio CMS database table and Storage bucket migration added.
- Public portfolio list/detail pages now read published CMS data with static fallback.
- Admin Portfolio CMS route added at `/admin/portfolio`.
- Admin users with CMS access can create, edit, publish, unpublish, and upload portfolio images.
- Super admin can archive and restore portfolio CMS items.

## Role Notes For Phase 2B

- `super_admin`: can view and manage projects, clients, and updates.
- `project_manager`: can create/manage projects and add project updates.
- `sales`: can create clients and project records, and view project status.
- `content_manager`: can access the admin dashboard placeholder only; CMS remains future scope.
- `client`: can access only client routes and view linked project data.

## Remaining After Phase 2C

- Run the Storage bucket/policy migration in Supabase if not already applied.
- Run the project delete policy migration in Supabase before testing delete actions in production.
- Run `supabase/migrations/20260612030000_fix_project_delete_policies.sql` if delete actions appear successful but records still return after refresh.
- Run `supabase/migrations/20260612050000_add_archive_fields.sql` before using client/project edit and archive controls.
- Run `supabase/migrations/20260612060000_add_portfolio_cms.sql` before using Portfolio CMS in production.
- Review whether production documents should move from public bucket URLs to private buckets with signed URLs.
- Add complete admin user management.
- Add stronger production RLS review and security test pass.
- Add CMS in a later phase.
- Add deployment environment variables in Vercel.
