create or replace function public.admin_set_sbi_user_role(
  p_user_id uuid,
  p_role text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text := lower(trim(coalesce(p_role, '')));
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;
  if not coalesce(public.is_sbi_admin(), false) then
    raise exception 'Administrator access required';
  end if;
  if v_role not in ('user', 'admin') then
    raise exception 'Role must be user or admin';
  end if;
  if p_user_id = (select auth.uid()) then
    raise exception 'You cannot change your own role';
  end if;

  insert into public.sbi_user_profiles(user_id, role)
  values (p_user_id, v_role)
  on conflict (user_id) do update set role = excluded.role;

  if not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'User not found';
  end if;
end;
$$;

revoke all on function public.admin_set_sbi_user_role(uuid, text) from public, anon;
grant execute on function public.admin_set_sbi_user_role(uuid, text) to authenticated;