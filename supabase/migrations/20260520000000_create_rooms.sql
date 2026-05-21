create extension if not exists "pgcrypto";

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text,
  type text not null default 'direct' check (type in ('direct', 'group')),
  avatar_url text,
  last_message_at timestamptz default now(),
  created_at timestamptz not null default now()
);

create table public.room_members (
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

alter table public.rooms enable row level security;
alter table public.room_members enable row level security;

create policy "members can view their rooms"
  on public.rooms for select
  using (
    exists (
      select 1 from public.room_members
      where room_members.room_id = rooms.id
        and room_members.user_id = auth.uid()
    )
  );

create policy "users can view their own memberships"
  on public.room_members for select
  using (user_id = auth.uid());

create index rooms_last_message_at_idx on public.rooms (last_message_at desc);
create index room_members_user_id_idx on public.room_members (user_id);
