-- Allow members of a room to see every member of that room (not only themselves).
-- Required so getDirectRoomPeer can resolve the other party of a direct room.

-- SECURITY DEFINER helper avoids infinite recursion when room_members policy
-- references room_members.
create or replace function public.is_room_member(p_room_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.room_members
    where room_id = p_room_id
      and user_id = auth.uid()
  );
$$;

drop policy if exists "users can view their own memberships" on public.room_members;
drop policy if exists "members can view fellow members" on public.room_members;

create policy "members can view fellow members"
  on public.room_members for select
  using (public.is_room_member(room_id));
