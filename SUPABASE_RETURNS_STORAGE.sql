-- SBI v67.19 — stockage privé des photos de retours clients
-- À exécuter une seule fois dans Supabase > SQL Editor, avec un compte administrateur du projet.
-- Les photos ne sont accessibles qu'aux utilisateurs authentifiés du site.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'sbi-retours-clients',
  'sbi-retours-clients',
  false,
  10485760,
  array['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif','image/heic-sequence','image/heif-sequence']::text[]
)
on conflict (id) do update set
  name = excluded.name,
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "SBI return photos read authenticated" on storage.objects;
create policy "SBI return photos read authenticated"
on storage.objects for select to authenticated
using (bucket_id = 'sbi-retours-clients');

drop policy if exists "SBI return photos insert authenticated" on storage.objects;
create policy "SBI return photos insert authenticated"
on storage.objects for insert to authenticated
with check (bucket_id = 'sbi-retours-clients');

drop policy if exists "SBI return photos update authenticated" on storage.objects;
create policy "SBI return photos update authenticated"
on storage.objects for update to authenticated
using (bucket_id = 'sbi-retours-clients')
with check (bucket_id = 'sbi-retours-clients');

drop policy if exists "SBI return photos delete authenticated" on storage.objects;
create policy "SBI return photos delete authenticated"
on storage.objects for delete to authenticated
using (bucket_id = 'sbi-retours-clients');
