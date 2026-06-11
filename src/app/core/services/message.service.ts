import { supabase } from '@app/libs/supabase/client';
import {
  normalizeMessage,
  normalizeMessages,
  type MessageRow,
} from '@app/core/mappers/chat.mapper';
import { mapSupabaseError } from '@core/errors/AppError';
import type { Message } from '@app/types/chat';

export type { Message, OptimisticMessage } from '@app/types/chat';
export {
  MESSAGE_DELIVERY_STATUS,
  type MessageDeliveryStatus,
  MESSAGE_TYPE,
  type MessageType,
} from '@app/types/chat';

export const MESSAGE_PAGE_SIZE = 30;

export const getMessagesByRoomId = async (
  roomId: string,
  cursor?: string,
): Promise<Message[]> => {
  let query = supabase
    .from('messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .limit(MESSAGE_PAGE_SIZE);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;

  if (error) throw mapSupabaseError(error, 'query');
  return normalizeMessages((data ?? []) as MessageRow[]);
};

export interface SendMessagePayload {
  roomId: string;
  senderId: string;
  content: string;
}

export const sendMessage = async ({
  roomId,
  content,
}: SendMessagePayload): Promise<Message> => {
  // Route through SECURITY DEFINER RPC so RLS on messages/rooms is enforced
  // server-side. Avoids client-side RLS denial when JWT claims and policy
  // visibility get out of sync, and updates rooms.last_message_at atomically.
  /* eslint-disable camelcase -- Postgres function parameter names */
  const { data, error } = await supabase.rpc('send_message', {
    p_room_id: roomId,
    p_content: content,
  });

  if (error) throw mapSupabaseError(error, 'rpc');
  return normalizeMessage(data as MessageRow);
};

export interface SendImageMessagePayload {
  roomId: string;
  storagePath: string;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
}

export const sendImageMessage = async ({
  roomId,
  storagePath,
  fileName,
  fileSize,
  mimeType,
}: SendImageMessagePayload): Promise<Message> => {
  /* eslint-disable camelcase -- Postgres function parameter names */
  const { data, error } = await supabase.rpc('send_image_message', {
    p_room_id: roomId,
    p_storage_path: storagePath,
    p_file_name: fileName ?? null,
    p_file_size: fileSize ?? null,
    p_mime_type: mimeType ?? null,
  });
  /* eslint-enable camelcase */

  if (error) throw mapSupabaseError(error, 'rpc');
  return normalizeMessage(data as MessageRow);
};
