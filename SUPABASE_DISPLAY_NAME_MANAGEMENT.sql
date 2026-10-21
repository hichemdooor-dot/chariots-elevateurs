-- SBI display-name management
-- Run once in Supabase Dashboard -> SQL Editor.
-- This changes only auth.users.raw_user_meta_data.full_name. It does not change
-- email, password, app_metadata, role, or account status.

create or replace function public.admin_list_sbi_user_display_names()
returns table(user_id uuid, display_name text)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
  v_app_role text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select u.email,
         coalesce(u.raw_app_meta_data ->> 'sbi_role', '')
    into v_email, v_app_role
    from auth.users u
   where u.id = auth.uid();

  if lower(coalesce(v_email, '')) <> 'hichemdooor@gmail.com'
     and lower(coalesce(v_app_role, '')) <> 'admin' then
    raise exception 'Administrator access required';
  end if;

  return query
  select u.id,
         coalesce(
           nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
           nullif(trim(u.raw_user_meta_data ->> 'name'), ''),
           nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
           'Utilisateur'
         )::text
    from auth.users u
   order by lower(coalesce(u.email, ''));
end;
$$;

create or replace function public.admin_set_sbi_user_display_name(
  p_user_id uuid,
  p_display_name text
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
  v_app_role text;
  v_name text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  v_name := trim(coalesce(p_display_name, ''));
  if char_length(v_name) < 1 or char_length(v_name) > 80 then
    raise exception 'Display name must contain between 1 and 80 characters';
  end if;

  select u.email,
         coalesce(u.raw_app_meta_data ->> 'sbi_role', '')
    into v_email, v_app_role
    from auth.users u
   where u.id = auth.uid();

  if lower(coalesce(v_email, '')) <> 'hichemdooor@gmail.com'
     and lower(coalesce(v_app_role, '')) <> 'admin' then
    raise exception 'Administrator access required';
  end if;

  update auth.users
     set raw_user_meta_data =
       coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('full_name', v_name),
         updated_at = now()
   where id = p_user_id;

  if not found then
    raise exception 'User not found';
  end if;
end;
$$;

revoke all on function public.admin_list_sbi_user_display_names() from public, anon;
revoke all on function public.admin_set_sbi_user_display_name(uuid, text) from public, anon;
grant execute on function public.admin_list_sbi_user_display_names() to authenticated;
grant execute on function public.admin_set_sbi_user_display_name(uuid, text) to authenticated;
