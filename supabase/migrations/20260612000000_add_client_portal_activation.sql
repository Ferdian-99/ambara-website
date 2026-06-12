alter table public.clients
add column if not exists portal_activated_at timestamptz;

create or replace function public.mark_own_client_portal_active()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.clients
  set portal_activated_at = coalesce(portal_activated_at, now())
  where user_id = auth.uid()
    and portal_activated_at is null;
end;
$$;

grant execute on function public.mark_own_client_portal_active() to authenticated;
