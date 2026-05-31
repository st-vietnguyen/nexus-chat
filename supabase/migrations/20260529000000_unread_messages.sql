-- Track per-member last read timestamp for unread message counts.
alter table public.room_members
  add column if not exists last_read_at timestamptz not null default now();

create index if not exists room_members_user_last_read_idx
  on public.room_members (user_id, last_read_at);

-- SECURITY DEFINER RPC so the caller does not need an UPDATE policy on
-- room_members. Clamps to greatest(existing, now()) to prevent regressing
-- the read marker on out-of-order calls.
create or replace function public.mark_room_read(p_room_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  new_ts timestamptz := now();
begin
  if auth.uid() is null then
    raise exception 'unauthenticated' using errcode = '42501';
  end if;

  update public.room_members
  set last_read_at = greatest(last_read_at, new_ts)
  where room_id = p_room_id
    and user_id = auth.uid()
  returning last_read_at into new_ts;

  if new_ts is null then
    raise exception 'not a member of room %', p_room_id using errcode = '42501';
  end if;

  return new_ts;
end;
$$;

grant execute on function public.mark_room_read(uuid) to authenticated;
