-- RPC: send_image_message
-- Security guarantees (SECURITY DEFINER):
--   1. Caller must be authenticated.
--   2. Caller must be a member of the target room.
--   3. The storage path must be scoped to that room and the caller's user ID,
--      preventing users from registering images uploaded by others.

create function public.send_image_message(
  p_room_id     uuid,
  p_storage_path text,
  p_file_name   text    default null,
  p_file_size   bigint  default null,
  p_mime_type   text    default null
)
returns public.messages
language plpgsql
security definer
set search_path = public
as $$
declare
  new_message    public.messages;
  expected_prefix text := 'rooms/' || p_room_id::text || '/' || auth.uid()::text || '/';
begin
  if auth.uid() is null then
    raise exception 'unauthenticated' using errcode = '42501';
  end if;

  -- Verify path belongs to this room AND this user
  if not (p_storage_path like expected_prefix || '%') then
    raise exception 'invalid storage path for room %', p_room_id using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.room_members
    where room_id = p_room_id
      and user_id = auth.uid()
  ) then
    raise exception 'not a member of room %', p_room_id using errcode = '42501';
  end if;

  insert into public.messages (
    room_id, sender_id, type, storage_path, file_name, file_size, mime_type
  )
  values (
    p_room_id, auth.uid(), 'image', p_storage_path, p_file_name, p_file_size, p_mime_type
  )
  returning * into new_message;

  update public.rooms
  set last_message_at = new_message.created_at
  where id = p_room_id;

  return new_message;
end;
$$;

grant execute on function public.send_image_message(uuid, text, text, bigint, text) to authenticated;
