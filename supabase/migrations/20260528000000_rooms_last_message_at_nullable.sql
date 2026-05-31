-- Drafts (rooms with no messages) should be hidden from the room list for both
-- members. The client filters rooms by `last_message_at IS NOT NULL`, but the
-- column previously defaulted to `now()` on insert, which made every freshly
-- created room appear as if it already had activity. Drop the default so newly
-- created rooms start with NULL and only get a timestamp once `send_message`
-- writes the first message.
alter table public.rooms alter column last_message_at drop default;
