drop policy if exists "project updates manager delete" on public.project_updates;
create policy "project updates manager delete"
on public.project_updates for delete
using (public.can_manage_projects());

drop policy if exists "project documents manager delete" on public.project_documents;
create policy "project documents manager delete"
on public.project_documents for delete
using (public.can_manage_projects());

drop policy if exists "project photos manager delete" on public.project_photos;
create policy "project photos manager delete"
on public.project_photos for delete
using (public.can_manage_projects());

drop policy if exists "project documents manager storage delete" on storage.objects;
create policy "project documents manager storage delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'project-documents'
  and public.can_manage_projects()
);

drop policy if exists "project photos manager storage delete" on storage.objects;
create policy "project photos manager storage delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'project-photos'
  and public.can_manage_projects()
);
