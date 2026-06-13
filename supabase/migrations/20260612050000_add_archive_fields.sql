alter table public.clients
add column if not exists archived_at timestamptz;

alter table public.projects
add column if not exists archived_at timestamptz;

alter table public.projects
add column if not exists budget_range text;

create or replace function public.prevent_non_super_admin_client_archive_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.archived_at is distinct from new.archived_at
    and public.current_user_role() <> 'super_admin'
  then
    raise exception 'Only super_admin can archive or restore clients.';
  end if;

  return new;
end;
$$;

drop trigger if exists clients_archive_guard on public.clients;
create trigger clients_archive_guard
before update on public.clients
for each row
execute function public.prevent_non_super_admin_client_archive_change();

drop policy if exists "clients admin update" on public.clients;
create policy "clients admin update"
on public.clients for update
using (public.current_user_role() in ('super_admin', 'sales'))
with check (public.current_user_role() in ('super_admin', 'sales'));

drop policy if exists "projects manager update" on public.projects;
create policy "projects manager update"
on public.projects for update
using (public.can_manage_projects())
with check (public.can_manage_projects());
