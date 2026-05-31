-- Add chat tables to the supabase_realtime publication so Postgres broadcasts
-- INSERT/UPDATE/DELETE events to subscribed clients. Without this, the
-- supabase-js .channel().on('postgres_changes', ...) subscriptions silently
-- succeed but never receive payloads.
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.room_members;
