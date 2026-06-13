create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text,
  location text,
  year text,
  short_description text,
  description text,
  cover_image_url text,
  gallery_urls text[] not null default '{}',
  services text[] not null default '{}',
  materials text[] not null default '{}',
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portfolio_items enable row level security;

create or replace function public.prevent_non_super_admin_portfolio_archive_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.archived_at is distinct from new.archived_at
    and public.current_user_role() <> 'super_admin'
  then
    raise exception 'Only super_admin can archive or restore portfolio items.';
  end if;

  return new;
end;
$$;

drop trigger if exists portfolio_archive_guard on public.portfolio_items;
create trigger portfolio_archive_guard
before update on public.portfolio_items
for each row
execute function public.prevent_non_super_admin_portfolio_archive_change();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-images',
  'portfolio-images',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "portfolio public published read" on public.portfolio_items;
create policy "portfolio public published read"
on public.portfolio_items for select
using (published_at is not null and archived_at is null);

drop policy if exists "portfolio admin read all" on public.portfolio_items;
create policy "portfolio admin read all"
on public.portfolio_items for select
to authenticated
using (public.current_user_role() in ('super_admin', 'content_manager'));

drop policy if exists "portfolio admin insert" on public.portfolio_items;
create policy "portfolio admin insert"
on public.portfolio_items for insert
to authenticated
with check (public.current_user_role() in ('super_admin', 'content_manager'));

drop policy if exists "portfolio admin update" on public.portfolio_items;
create policy "portfolio admin update"
on public.portfolio_items for update
to authenticated
using (public.current_user_role() in ('super_admin', 'content_manager'))
with check (public.current_user_role() in ('super_admin', 'content_manager'));

drop policy if exists "portfolio images public read" on storage.objects;
create policy "portfolio images public read"
on storage.objects for select
using (bucket_id = 'portfolio-images');

drop policy if exists "portfolio images admin upload" on storage.objects;
create policy "portfolio images admin upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'portfolio-images'
  and public.current_user_role() in ('super_admin', 'content_manager')
);

drop policy if exists "portfolio images admin update" on storage.objects;
create policy "portfolio images admin update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'portfolio-images'
  and public.current_user_role() in ('super_admin', 'content_manager')
)
with check (
  bucket_id = 'portfolio-images'
  and public.current_user_role() in ('super_admin', 'content_manager')
);

insert into public.portfolio_items (
  title,
  slug,
  category,
  location,
  year,
  short_description,
  description,
  cover_image_url,
  gallery_urls,
  services,
  materials,
  is_featured,
  sort_order,
  published_at
)
values
(
  'Residensi Senja',
  'residensi-senja',
  'Residensial',
  'Jakarta Selatan',
  '2026',
  'Hunian keluarga dengan ruang publik yang teduh, garis rendah, dan transisi material yang lembut.',
  'AMBARA merancang ruang keluarga, pantry, dan built-in storage dengan palet ivory, stone gray, dan aksen charcoal yang tenang.',
  '/assets/project-residensi-senja.png',
  array['/assets/project-residensi-senja.png'],
  array['Interior Design', 'Built-in Furniture', 'Custom Furniture'],
  array['Oak veneer ringan', 'Linen ivory', 'Charcoal metal'],
  true,
  10,
  now()
),
(
  'Villa Aksara',
  'villa-aksara',
  'Villa',
  'Bali',
  '2025',
  'Villa tropis kontemporer dengan furnitur kustom yang ringan, terukur, dan tidak menutup arsitektur.',
  'Setiap modul dibuat dengan struktur tahan lembap, siluet bersih, dan aksen metal tipis untuk memberi rasa premium.',
  '/assets/project-villa-aksara.png',
  array['/assets/project-villa-aksara.png'],
  array['Custom Furniture', 'Residential Project'],
  array['Stone gray plaster', 'Brushed champagne metal', 'Outdoor-grade fabric'],
  false,
  20,
  now()
),
(
  'Studio Nara',
  'studio-nara',
  'Komersial',
  'Bandung',
  '2025',
  'Ruang konsultasi dan display yang terasa seperti galeri kecil, bukan showroom yang ramai.',
  'Layout dibuat bertahap: area penerima, meja konsultasi, display material, dan ruang diskusi yang saling terhubung.',
  '/assets/project-studio-nara.png',
  array['/assets/project-studio-nara.png'],
  array['Commercial Project', 'Space Planning'],
  array['Matte plaster', 'Blackened steel', 'Textured glass'],
  false,
  30,
  now()
)
on conflict (slug) do nothing;
