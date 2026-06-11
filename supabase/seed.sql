-- Run this after creating auth users in Supabase Authentication.
-- Replace the UUID values with IDs from auth.users.

insert into public.profiles (id, full_name, email, role, phone)
values
  ('a38ec8e0-71b4-4693-a9c2-9736e3dbec6d', 'AMBARA Super Admin', 'admin@ambara.local', 'super_admin', '+62 800 0000 0000'),
  ('3990c748-83bc-4e91-9d4c-0bdb6a6bcf77', 'Nadia Pramana', 'client@ambara.local', 'client', '+62 811 0000 0000')
on conflict (id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  role = excluded.role,
  phone = excluded.phone;

insert into public.clients (id, user_id, name, email, phone, address)
values (
  '10000000-0000-0000-0000-000000000001',
  '3990c748-83bc-4e91-9d4c-0bdb6a6bcf77',
  'Nadia Pramana',
  'client@ambara.local',
  '+62 811 0000 0000',
  'Jakarta Selatan'
)
on conflict (id) do update set
  user_id = excluded.user_id,
  name = excluded.name,
  email = excluded.email,
  phone = excluded.phone,
  address = excluded.address;

insert into public.projects (
  id,
  client_id,
  project_code,
  project_name,
  project_type,
  location,
  current_stage,
  progress_percentage,
  status,
  estimated_completion,
  notes
)
values (
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'AMB-2026-001',
  'Residensi Senja - Built-in Living Cabinet',
  'Built-in Furniture',
  'Jakarta Selatan',
  'Produksi',
  58,
  'active',
  '2026-07-28',
  'Panel kabinet utama sudah masuk tahap produksi. Tim workshop sedang menyelesaikan struktur dasar sebelum masuk proses veneer dan finishing akhir.'
)
on conflict (project_code) do update set
  project_name = excluded.project_name,
  current_stage = excluded.current_stage,
  progress_percentage = excluded.progress_percentage,
  notes = excluded.notes;

insert into public.project_updates (project_id, title, description, stage, progress_percentage, created_by)
values
  ('20000000-0000-0000-0000-000000000001', 'Produksi dimulai', 'Produksi kabinet utama dimulai setelah approval material.', 'Produksi', 58, '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000001', 'Revisi disetujui', 'Revisi detail handle dan proporsi panel disetujui.', 'Persetujuan', 42, '00000000-0000-0000-0000-000000000001');

insert into public.project_documents (project_id, file_name, file_url, file_type, uploaded_by)
values
  ('20000000-0000-0000-0000-000000000001', 'Quotation', 'https://example.com/quotation.pdf', 'pdf', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000001', 'Desain Final', 'https://example.com/desain-final.pdf', 'pdf', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000001', 'Invoice', 'https://example.com/invoice.pdf', 'pdf', '00000000-0000-0000-0000-000000000001');

insert into public.project_photos (project_id, image_url, caption, uploaded_by)
values (
  '20000000-0000-0000-0000-000000000001',
  '/assets/workshop-progress.png',
  'Progress workshop kabinet utama',
  '00000000-0000-0000-0000-000000000001'
);
