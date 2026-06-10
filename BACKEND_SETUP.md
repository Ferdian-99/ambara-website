# AMBARA Backend Setup

Phase 2A adds the Supabase foundation for authentication, roles, protected dashboard routes, and project tracking data. The public website remains unchanged.

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

## Remaining After Phase 2A

- Replace dashboard placeholder lists with live CRUD queries.
- Implement real project create/update mutations.
- Implement Supabase Storage upload flows.
- Add complete admin user management.
- Add stronger production RLS review and security test pass.
- Add CMS in a later phase.
- Add deployment environment variables in Vercel.
