-- Create the chat-images storage bucket and its RLS policies.
-- The bucket is public so image URLs work without signed tokens.

insert into storage.buckets (id, name, public)
values ('chat-images', 'chat-images', true)
on conflict (id) do nothing;

-- Authenticated users may upload only to their own sub-folder:
--   rooms/{roomId}/{userId}/{filename}
-- Server-side membership check is handled by the send_image_message RPC.
create policy "users can upload own chat images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'chat-images'
    and name like 'rooms/%/' || auth.uid()::text || '/%'
  );

-- Any authenticated user can read images (room membership is enforced at the
-- application layer; images are not sensitive enough to require per-row RLS).
create policy "authenticated users can view chat images"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'chat-images');
