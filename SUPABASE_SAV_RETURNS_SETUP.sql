-- SBI SAV & retours clients — installation (à exécuter une seule fois dans Supabase SQL Editor)
-- Les retours sont stockés dans une table dédiée pour ne pas mélanger ces dossiers
-- avec l'historique habituel de maintenance / livraison.

create table if not exists public.sbi_sav_returns (
  case_id text primary key,
  qr_id text not null,
  chassis text,
  engine text,
  capacity text,
  stock text,
  client text not null,
  return_date date not null,
  category text not null,
  return_condition text,
  status text not null default 'Retour signalé',
  problem text not null,
  diagnosis text,
  repair_action text,
  parts text,
  technician text,
  decision text,
  restituted_date date,
  observations text,
  images jsonb not null default '[]'::jsonb,
  history jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sbi_sav_returns_return_date_idx on public.sbi_sav_returns (return_date desc);
create index if not exists sbi_sav_returns_qr_id_idx on public.sbi_sav_returns (qr_id);
create index if not exists sbi_sav_returns_status_idx on public.sbi_sav_returns (status);

grant select, insert, update on public.sbi_sav_returns to authenticated;
alter table public.sbi_sav_returns enable row level security;

drop policy if exists "SBI SAV returns select authenticated" on public.sbi_sav_returns;
create policy "SBI SAV returns select authenticated"
on public.sbi_sav_returns for select to authenticated using (true);

drop policy if exists "SBI SAV returns insert authenticated" on public.sbi_sav_returns;
create policy "SBI SAV returns insert authenticated"
on public.sbi_sav_returns for insert to authenticated with check (true);

drop policy if exists "SBI SAV returns update authenticated" on public.sbi_sav_returns;
create policy "SBI SAV returns update authenticated"
on public.sbi_sav_returns for update to authenticated using (true) with check (true);

-- Bucket privé pour les photos (10 Mo maximum par image).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sbi-retours-clients','sbi-retours-clients',false,10485760,
  array['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif','image/heic-sequence','image/heif-sequence']::text[])
on conflict (id) do update set name=excluded.name, public=false, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "SBI SAV return photos read authenticated" on storage.objects;
create policy "SBI SAV return photos read authenticated"
on storage.objects for select to authenticated using (bucket_id = 'sbi-retours-clients');

drop policy if exists "SBI SAV return photos insert authenticated" on storage.objects;
create policy "SBI SAV return photos insert authenticated"
on storage.objects for insert to authenticated with check (bucket_id = 'sbi-retours-clients');

drop policy if exists "SBI SAV return photos delete own authenticated" on storage.objects;
create policy "SBI SAV return photos delete own authenticated"
on storage.objects for delete to authenticated
using (bucket_id = 'sbi-retours-clients' and owner_id = auth.uid()::text);
