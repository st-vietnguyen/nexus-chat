create table public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "room members can view messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.room_members
      where room_members.room_id = messages.room_id
        and room_members.user_id = auth.uid()
    )
  );

create policy "room members can send messages"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.room_members
      where room_members.room_id = messages.room_id
        and room_members.user_id = auth.uid()
    )
  );

create index messages_room_id_created_at_idx on public.messages (room_id, created_at desc);
