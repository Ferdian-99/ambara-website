create table if not exists public.site_settings (
  id text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

alter table public.site_settings enable row level security;

insert into public.site_settings (id, value)
values ('homepage', '{}'::jsonb)
on conflict (id) do nothing;

drop policy if exists "site settings homepage public read" on public.site_settings;
create policy "site settings homepage public read"
on public.site_settings for select
using (id = 'homepage');

drop policy if exists "site settings admin read all" on public.site_settings;
create policy "site settings admin read all"
on public.site_settings for select
to authenticated
using (public.current_user_role() in ('super_admin', 'content_manager'));

drop policy if exists "site settings cms insert" on public.site_settings;
create policy "site settings cms insert"
on public.site_settings for insert
to authenticated
with check (
  id = 'homepage'
  and public.current_user_role() in ('super_admin', 'content_manager')
);

drop policy if exists "site settings cms update" on public.site_settings;
create policy "site settings cms update"
on public.site_settings for update
to authenticated
using (
  id = 'homepage'
  and public.current_user_role() in ('super_admin', 'content_manager')
)
with check (
  id = 'homepage'
  and public.current_user_role() in ('super_admin', 'content_manager')
);
