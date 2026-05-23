create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "authenticated users can view profiles"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create index profiles_display_name_idx on public.profiles (lower(display_name));
create index profiles_email_idx on public.profiles (lower(email));

create policy "authenticated users can create rooms"
  on public.rooms for insert
  with check (auth.role() = 'authenticated');

create function public.get_or_create_direct_room(other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_room_id uuid;
  new_room_id uuid;
begin
  select rm1.room_id into existing_room_id
  from room_members rm1
  join room_members rm2 on rm1.room_id = rm2.room_id
  join rooms r on r.id = rm1.room_id
  where rm1.user_id = auth.uid()
    and rm2.user_id = other_user_id
    and r.type = 'direct'
  limit 1;

  if existing_room_id is not null then
    return existing_room_id;
  end if;

  insert into public.rooms (type)
  values ('direct')
  returning id into new_room_id;

  insert into public.room_members (room_id, user_id) values
    (new_room_id, auth.uid()),
    (new_room_id, other_user_id);

  return new_room_id;
end;
$$;
