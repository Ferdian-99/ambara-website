insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-documents',
  'project-documents',
  true,
  10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-photos',
  'project-photos',
  true,
  8388608,
  array[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "project documents public read" on storage.objects;
create policy "project documents public read"
on storage.objects for select
using (bucket_id = 'project-documents');

drop policy if exists "project photos public read" on storage.objects;
create policy "project photos public read"
on storage.objects for select
using (bucket_id = 'project-photos');

drop policy if exists "project documents manager upload" on storage.objects;
create policy "project documents manager upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'project-documents'
  and public.can_manage_projects()
);

drop policy if exists "project photos manager upload" on storage.objects;
create policy "project photos manager upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'project-photos'
  and public.can_manage_projects()
);
