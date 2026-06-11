-- Extend messages table to support image messages.
-- Existing text messages are unaffected: content stays required for type='text'.

-- 1. Make content nullable so image messages can omit it
alter table public.messages
  alter column content drop not null;

-- 2. Add message type column (defaults to 'text' so all existing rows stay valid)
alter table public.messages
  add column type text not null default 'text'
  constraint messages_type_check check (type in ('text', 'image'));

-- 3. Add image metadata columns
alter table public.messages
  add column storage_path text,
  add column file_name    text,
  add column file_size    bigint,
  add column mime_type    text;

-- 4. Enforce type-specific consistency:
--    text messages  → content must not be null
--    image messages → storage_path must not be null
alter table public.messages
  add constraint messages_content_image_check check (
    (type = 'text'  and content      is not null) or
    (type = 'image' and storage_path is not null)
  );
