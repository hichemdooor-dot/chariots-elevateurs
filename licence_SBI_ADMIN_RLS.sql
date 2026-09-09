-- Sécurisation de la licence SBI
-- Remplace YOUR_ADMIN_EMAIL par l'adresse du compte administrateur déjà utilisée dans ton application.

alter table public.licenses enable row level security;

drop policy if exists "license_check_sbi" on public.licenses;
create policy "license_check_sbi"
on public.licenses
for select
to anon, authenticated
using (company_name = 'SBI');

drop policy if exists "license_admin_update_sbi" on public.licenses;
create policy "license_admin_update_sbi"
on public.licenses
for update
to authenticated
using (
  company_name = 'SBI'
  and lower(coalesce(auth.jwt() ->> 'email','')) = lower('YOUR_ADMIN_EMAIL')
)
with check (
  company_name = 'SBI'
  and lower(coalesce(auth.jwt() ->> 'email','')) = lower('YOUR_ADMIN_EMAIL')
);

-- Pas de droits d'insertion/suppression pour les utilisateurs de l'application.
-- La création initiale de la licence se fait dans le SQL Editor.
