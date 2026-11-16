-- SBI app installation announcement: shared settings and admin-only writes.
-- Run this script once in Supabase Dashboard -> SQL Editor.

create table if not exists public.sbi_app_install_announcement (
  id text primary key default 'global' check (id = 'global'),
  enabled boolean not null default true,
  title text not null default 'Installez SBI sur votre téléphone !'
    check (char_length(title) between 1 and 100),
  message text not null default 'Accédez à SBI directement depuis votre écran d’accueil.'
    check (char_length(message) between 1 and 500),
  frequency text not null default 'daily'
    check (frequency in ('always', 'daily', 'once')),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.sbi_app_install_announcement enable row level security;

grant select on public.sbi_app_install_announcement to anon, authenticated;
grant update on public.sbi_app_install_announcement to authenticated;

drop policy if exists "Anyone can read SBI install announcement" on public.sbi_app_install_announcement;
create policy "Anyone can read SBI install announcement"
  on public.sbi_app_install_announcement
  for select
  to anon, authenticated
  using (true);

drop policy if exists "SBI admins can update install announcement" on public.sbi_app_install_announcement;
create policy "SBI admins can update install announcement"
  on public.sbi_app_install_announcement
  for update
  to authenticated
  using (
    lower(coalesce(auth.jwt() ->> 'email', '')) = 'hichemdooor@gmail.com'
    or lower(coalesce(auth.jwt() -> 'app_metadata' ->> 'sbi_role', '')) = 'admin'
  )
  with check (
    lower(coalesce(auth.jwt() ->> 'email', '')) = 'hichemdooor@gmail.com'
    or lower(coalesce(auth.jwt() -> 'app_metadata' ->> 'sbi_role', '')) = 'admin'
  );

insert into public.sbi_app_install_announcement (id, enabled, title, message, frequency)
values ('global', true, 'Installez SBI sur votre téléphone !',
        'Accédez à SBI directement depuis votre écran d’accueil.', 'daily')
on conflict (id) do nothing;
