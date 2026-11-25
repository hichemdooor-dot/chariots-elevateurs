-- SBI — Fiche de livraison print traceability
-- Separate audit table. Does not alter existing SBI tables.
create table if not exists public.fiche_print_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete restrict,
  user_email text,
  user_name text,
  qr_id text,
  chassis_number text,
  client_name text,
  destination text,
  print_type text not null default 'fiche_livraison',
  created_at timestamptz not null default now()
);

create index if not exists fiche_print_history_created_at_idx
  on public.fiche_print_history (created_at desc);
create index if not exists fiche_print_history_user_id_created_at_idx
  on public.fiche_print_history (user_id, created_at desc);
create index if not exists fiche_print_history_chassis_idx
  on public.fiche_print_history (chassis_number);

alter table public.fiche_print_history enable row level security;

drop policy if exists "Users can insert their own fiche print history" on public.fiche_print_history;
create policy "Users can insert their own fiche print history"
  on public.fiche_print_history
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users read own and admin reads all fiche print history" on public.fiche_print_history;
create policy "Users read own and admin reads all fiche print history"
  on public.fiche_print_history
  for select to authenticated
  using (
    auth.uid() = user_id
    or lower(coalesce(auth.jwt() ->> 'email', '')) = 'hichemdooor@gmail.com'
  );

-- Deliberately no UPDATE or DELETE policy: audit events are immutable for clients.

-- Always stamp identity from the authenticated JWT, not browser-supplied values.
create or replace function public.sbi_stamp_fiche_print_identity()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  claims jsonb := coalesce(auth.jwt(), '{}'::jsonb);
  metadata jsonb := coalesce(claims -> 'user_metadata', '{}'::jsonb);
begin
  new.user_id := auth.uid();
  new.user_email := claims ->> 'email';
  new.user_name := coalesce(
    nullif(metadata ->> 'full_name', ''),
    nullif(metadata ->> 'name', ''),
    nullif(metadata ->> 'display_name', ''),
    claims ->> 'email',
    'Utilisateur'
  );
  return new;
end;
$$;

drop trigger if exists sbi_stamp_fiche_print_identity on public.fiche_print_history;
create trigger sbi_stamp_fiche_print_identity
before insert on public.fiche_print_history
for each row execute function public.sbi_stamp_fiche_print_identity();
