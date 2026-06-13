create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  project_type text,
  budget_range text,
  message text not null,
  source text not null default 'contact_page',
  status text not null default 'new',
  created_at timestamptz not null default now(),
  read_at timestamptz,
  archived_at timestamptz,
  handled_by uuid references public.profiles(id) on delete set null,
  constraint contact_messages_status_check check (status in ('new', 'read', 'followed_up', 'archived'))
);

alter table public.contact_messages enable row level security;

drop policy if exists "contact messages public insert" on public.contact_messages;
create policy "contact messages public insert"
on public.contact_messages for insert
to anon, authenticated
with check (
  status = 'new'
  and source = 'contact_page'
  and read_at is null
  and archived_at is null
  and handled_by is null
);

drop policy if exists "contact messages admin read" on public.contact_messages;
create policy "contact messages admin read"
on public.contact_messages for select
to authenticated
using (public.current_user_role() in ('super_admin', 'sales'));

drop policy if exists "contact messages admin update" on public.contact_messages;
create policy "contact messages admin update"
on public.contact_messages for update
to authenticated
using (public.current_user_role() in ('super_admin', 'sales'))
with check (public.current_user_role() in ('super_admin', 'sales'));
