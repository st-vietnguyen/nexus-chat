create function public.send_message(
  p_room_id uuid,
  p_content text
)
returns public.messages
language plpgsql
security definer
set search_path = public
as $$
declare
  new_message public.messages;
  trimmed text := btrim(p_content);
begin
  if auth.uid() is null then
    raise exception 'unauthenticated' using errcode = '42501';
  end if;

  if trimmed = '' then
    raise exception 'empty content' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.room_members
    where room_id = p_room_id
      and user_id = auth.uid()
  ) then
    raise exception 'not a member of room %', p_room_id using errcode = '42501';
  end if;

  insert into public.messages (room_id, sender_id, content)
  values (p_room_id, auth.uid(), trimmed)
  returning * into new_message;

  update public.rooms
  set last_message_at = new_message.created_at
  where id = p_room_id;

  return new_message;
end;
$$;

grant execute on function public.send_message(uuid, text) to authenticated;
