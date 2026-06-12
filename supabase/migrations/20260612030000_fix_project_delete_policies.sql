drop policy if exists "project updates manager delete" on public.project_updates;
create policy "project updates manager delete"
on public.project_updates for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'project_manager')
  )
);

drop policy if exists "project documents manager delete" on public.project_documents;
create policy "project documents manager delete"
on public.project_documents for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'project_manager')
  )
);

drop policy if exists "project photos manager delete" on public.project_photos;
create policy "project photos manager delete"
on public.project_photos for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'project_manager')
  )
);

drop policy if exists "project documents manager storage delete" on storage.objects;
create policy "project documents manager storage delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'project-documents'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'project_manager')
  )
);

drop policy if exists "project photos manager storage delete" on storage.objects;
create policy "project photos manager storage delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'project-photos'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'project_manager')
  )
);
