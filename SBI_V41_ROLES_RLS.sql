-- SBI V41 — Rôles et sécurité RLS
-- Administrateur : hichemdooor@gmail.com
-- Utilisateurs connectés : consultation
-- Important : exécuter après avoir sauvegardé la configuration actuelle.

-- Fonction serveur de rôle administrateur.
create or replace function public.is_sbi_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email','')) = lower('hichemdooor@gmail.com');
$$;

-- Autoriser l'exécution de la fonction aux utilisateurs authentifiés.
grant execute on function public.is_sbi_admin() to authenticated;

-- Active RLS sur les tables concernées.
alter table public.chariots enable row level security;
alter table public.maintenance enable row level security;

-- POLITIQUES V41
-- Lecture : utilisateurs authentifiés.
drop policy if exists "sbi_v41_chariots_select" on public.chariots;
create policy "sbi_v41_chariots_select"
on public.chariots
for select to authenticated
using (true);

-- Écriture chariots : administrateur uniquement.
drop policy if exists "sbi_v41_chariots_insert_admin" on public.chariots;
create policy "sbi_v41_chariots_insert_admin"
on public.chariots
for insert to authenticated
with check (public.is_sbi_admin());

drop policy if exists "sbi_v41_chariots_update_admin" on public.chariots;
create policy "sbi_v41_chariots_update_admin"
on public.chariots
for update to authenticated
using (public.is_sbi_admin())
with check (public.is_sbi_admin());

drop policy if exists "sbi_v41_chariots_delete_admin" on public.chariots;
create policy "sbi_v41_chariots_delete_admin"
on public.chariots
for delete to authenticated
using (public.is_sbi_admin());

-- Lecture maintenance : utilisateurs authentifiés.
drop policy if exists "sbi_v41_maintenance_select" on public.maintenance;
create policy "sbi_v41_maintenance_select"
on public.maintenance
for select to authenticated
using (true);

-- Écriture maintenance : administrateur uniquement.
drop policy if exists "sbi_v41_maintenance_insert_admin" on public.maintenance;
create policy "sbi_v41_maintenance_insert_admin"
on public.maintenance
for insert to authenticated
with check (public.is_sbi_admin());

drop policy if exists "sbi_v41_maintenance_update_admin" on public.maintenance;
create policy "sbi_v41_maintenance_update_admin"
on public.maintenance
for update to authenticated
using (public.is_sbi_admin())
with check (public.is_sbi_admin());

drop policy if exists "sbi_v41_maintenance_delete_admin" on public.maintenance;
create policy "sbi_v41_maintenance_delete_admin"
on public.maintenance
for delete to authenticated
using (public.is_sbi_admin());

-- LICENCE : l'administrateur conserve la modification.
-- La lecture reste possible pour le contrôle de licence.
drop policy if exists "sbi_v41_license_select" on public.licenses;
create policy "sbi_v41_license_select"
on public.licenses
for select to authenticated
using (company_name = 'SBI');

drop policy if exists "sbi_v41_license_update_admin" on public.licenses;
create policy "sbi_v41_license_update_admin"
on public.licenses
for update to authenticated
using (company_name = 'SBI' and public.is_sbi_admin())
with check (company_name = 'SBI' and public.is_sbi_admin());

-- Vérification : cette requête permet de voir les politiques existantes.
select schemaname, tablename, policyname, cmd
from pg_policies
where schemaname='public'
  and tablename in ('chariots','maintenance','licenses')
order by tablename, policyname;
