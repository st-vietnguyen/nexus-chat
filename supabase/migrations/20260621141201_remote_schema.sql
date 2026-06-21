drop extension if exists "pg_net";

drop policy "room members can send messages" on "public"."messages";

alter table "public"."messages" drop constraint "messages_content_image_check";

alter table "public"."messages" drop constraint "messages_type_check";


  create table "public"."message_attachments" (
    "id" uuid not null default gen_random_uuid(),
    "message_id" uuid not null,
    "room_id" uuid not null,
    "uploader_id" uuid not null,
    "file_name" text not null,
    "file_path" text not null,
    "file_type" text not null,
    "file_size" bigint not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."message_attachments" enable row level security;

CREATE INDEX message_attachments_message_id_idx ON public.message_attachments USING btree (message_id);

CREATE UNIQUE INDEX message_attachments_pkey ON public.message_attachments USING btree (id);

CREATE INDEX message_attachments_room_id_created_at_idx ON public.message_attachments USING btree (room_id, created_at DESC);

alter table "public"."message_attachments" add constraint "message_attachments_pkey" PRIMARY KEY using index "message_attachments_pkey";

alter table "public"."message_attachments" add constraint "message_attachments_message_id_fkey" FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE not valid;

alter table "public"."message_attachments" validate constraint "message_attachments_message_id_fkey";

alter table "public"."message_attachments" add constraint "message_attachments_room_id_fkey" FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE not valid;

alter table "public"."message_attachments" validate constraint "message_attachments_room_id_fkey";

alter table "public"."message_attachments" add constraint "message_attachments_uploader_id_fkey" FOREIGN KEY (uploader_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."message_attachments" validate constraint "message_attachments_uploader_id_fkey";

alter table "public"."messages" add constraint "messages_content_image_check" CHECK ((((type = 'text'::text) AND (content IS NOT NULL)) OR ((type = 'image'::text) AND (storage_path IS NOT NULL)) OR (type = 'file'::text))) not valid;

alter table "public"."messages" validate constraint "messages_content_image_check";

alter table "public"."messages" add constraint "messages_type_check" CHECK ((type = ANY (ARRAY['text'::text, 'image'::text, 'file'::text]))) not valid;

alter table "public"."messages" validate constraint "messages_type_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.send_file_message(p_room_id uuid, p_message_id uuid, p_file_name text, p_file_path text, p_file_type text, p_file_size bigint, p_content text DEFAULT NULL::text)
 RETURNS public.message_attachments
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  new_attachment public.message_attachments;
  expected_prefix text := 'rooms/' || p_room_id::text || '/' || p_message_id::text || '/';
begin
  if auth.uid() is null then
    raise exception 'unauthenticated' using errcode = '42501';
  end if;

  if not (p_file_path like expected_prefix || '%') then
    raise exception 'invalid storage path for room % / message %', p_room_id, p_message_id
      using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.room_members
    where room_id = p_room_id
      and user_id = auth.uid()
  ) then
    raise exception 'not a member of room %', p_room_id using errcode = '42501';
  end if;

  insert into public.messages (id, room_id, sender_id, type, content)
  values (p_message_id, p_room_id, auth.uid(), 'file', p_content);

  insert into public.message_attachments (
    message_id, room_id, uploader_id, file_name, file_path, file_type, file_size
  )
  values (
    p_message_id, p_room_id, auth.uid(), p_file_name, p_file_path, p_file_type, p_file_size
  )
  returning * into new_attachment;

  update public.rooms
  set last_message_at = now()
  where id = p_room_id;

  return new_attachment;
end;
$function$
;

grant delete on table "public"."message_attachments" to "anon";

grant insert on table "public"."message_attachments" to "anon";

grant references on table "public"."message_attachments" to "anon";

grant select on table "public"."message_attachments" to "anon";

grant trigger on table "public"."message_attachments" to "anon";

grant truncate on table "public"."message_attachments" to "anon";

grant update on table "public"."message_attachments" to "anon";

grant delete on table "public"."message_attachments" to "authenticated";

grant insert on table "public"."message_attachments" to "authenticated";

grant references on table "public"."message_attachments" to "authenticated";

grant select on table "public"."message_attachments" to "authenticated";

grant trigger on table "public"."message_attachments" to "authenticated";

grant truncate on table "public"."message_attachments" to "authenticated";

grant update on table "public"."message_attachments" to "authenticated";

grant delete on table "public"."message_attachments" to "service_role";

grant insert on table "public"."message_attachments" to "service_role";

grant references on table "public"."message_attachments" to "service_role";

grant select on table "public"."message_attachments" to "service_role";

grant trigger on table "public"."message_attachments" to "service_role";

grant truncate on table "public"."message_attachments" to "service_role";

grant update on table "public"."message_attachments" to "service_role";


  create policy "room members can read attachments"
  on "public"."message_attachments"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.room_members rm
  WHERE ((rm.room_id = message_attachments.room_id) AND (rm.user_id = auth.uid())))));


drop policy "authenticated users can view chat images" on "storage"."objects";


  create policy "authenticated users can view chat files"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'chat-files'::text));



  create policy "users can upload chat files into a room folder"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'chat-files'::text) AND (name ~~ 'rooms/%'::text)));



