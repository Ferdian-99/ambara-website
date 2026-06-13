create extension if not exists "pgcrypto";

do $$
begin
  create type public.user_role as enum ('super_admin', 'content_manager', 'project_manager', 'sales', 'client');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.project_status as enum ('draft', 'active', 'on_hold', 'completed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.project_stage as enum ('Konsultasi', 'Konsep Desain', 'Revisi', 'Persetujuan', 'Produksi', 'Finishing', 'Pengiriman', 'Instalasi', 'Selesai');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role public.user_role not null default 'client',
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  address text,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_code text not null unique,
  project_name text not null,
  project_type text not null,
  location text,
  budget_range text,
  current_stage public.project_stage not null default 'Konsultasi',
  progress_percentage integer not null default 0 check (progress_percentage >= 0 and progress_percentage <= 100),
  status public.project_status not null default 'active',
  estimated_completion date,
  notes text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  stage public.project_stage not null,
  progress_percentage integer not null default 0 check (progress_percentage >= 0 and progress_percentage <= 100),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.project_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_type text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.project_photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  image_url text not null,
  caption text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at before update on public.projects for each row execute function public.touch_updated_at();

create or replace function public.current_user_role()
returns public.user_role language sql security definer stable set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_internal_user()
returns boolean language sql security definer stable set search_path = public as $$
  select public.current_user_role() in ('super_admin', 'content_manager', 'project_manager', 'sales');
$$;

create or replace function public.can_manage_projects()
returns boolean language sql security definer stable set search_path = public as $$
  select public.current_user_role() in ('super_admin', 'project_manager');
$$;

create or replace function public.can_create_sales_records()
returns boolean language sql security definer stable set search_path = public as $$
  select public.current_user_role() in ('super_admin', 'sales');
$$;

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

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.project_updates enable row level security;
alter table public.project_documents enable row level security;
alter table public.project_photos enable row level security;

drop policy if exists "profiles can read own profile" on public.profiles;
create policy "profiles can read own profile" on public.profiles for select using (id = auth.uid() or public.is_internal_user());

drop policy if exists "super admin can manage profiles" on public.profiles;
create policy "super admin can manage profiles" on public.profiles for all using (public.current_user_role() = 'super_admin') with check (public.current_user_role() = 'super_admin');

drop policy if exists "clients internal read" on public.clients;
create policy "clients internal read" on public.clients for select using (public.is_internal_user() or user_id = auth.uid());

drop policy if exists "clients sales create" on public.clients;
create policy "clients sales create" on public.clients for insert with check (public.can_create_sales_records());

drop policy if exists "clients admin update" on public.clients;
create policy "clients admin update" on public.clients for update using (public.current_user_role() in ('super_admin', 'sales')) with check (public.current_user_role() in ('super_admin', 'sales'));

drop policy if exists "projects public code lookup" on public.projects;
create policy "projects public code lookup" on public.projects for select using (true);

drop policy if exists "projects internal create" on public.projects;
create policy "projects internal create" on public.projects for insert with check (public.current_user_role() in ('super_admin', 'sales', 'project_manager'));

drop policy if exists "projects manager update" on public.projects;
create policy "projects manager update" on public.projects for update using (public.can_manage_projects()) with check (public.can_manage_projects());

drop policy if exists "updates readable for project access" on public.project_updates;
create policy "updates readable for project access" on public.project_updates for select using (
  public.is_internal_user()
  or exists (select 1 from public.projects p join public.clients c on c.id = p.client_id where p.id = project_updates.project_id and c.user_id = auth.uid())
);

drop policy if exists "updates manager create" on public.project_updates;
create policy "updates manager create" on public.project_updates for insert with check (public.can_manage_projects());

drop policy if exists "documents readable for project access" on public.project_documents;
create policy "documents readable for project access" on public.project_documents for select using (
  public.is_internal_user()
  or exists (select 1 from public.projects p join public.clients c on c.id = p.client_id where p.id = project_documents.project_id and c.user_id = auth.uid())
);

drop policy if exists "documents manager create" on public.project_documents;
create policy "documents manager create" on public.project_documents for insert with check (public.can_manage_projects());

drop policy if exists "photos readable for project access" on public.project_photos;
create policy "photos readable for project access" on public.project_photos for select using (
  public.is_internal_user()
  or exists (select 1 from public.projects p join public.clients c on c.id = p.client_id where p.id = project_photos.project_id and c.user_id = auth.uid())
);

drop policy if exists "photos manager create" on public.project_photos;
create policy "photos manager create" on public.project_photos for insert with check (public.can_manage_projects());

insert into storage.buckets (id, name, public) values ('project-documents', 'project-documents', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('project-photos', 'project-photos', false) on conflict (id) do nothing;
