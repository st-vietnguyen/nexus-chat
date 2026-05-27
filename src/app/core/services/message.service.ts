import { supabase } from '@app/libs/supabase/client';
import type { Database } from '@app/types/database';

export type Message = Database['public']['Tables']['messages']['Row'];

export const MESSAGE_DELIVERY_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  FAILED: 'failed',
} as const;

export type MessageDeliveryStatus =
  (typeof MESSAGE_DELIVERY_STATUS)[keyof typeof MESSAGE_DELIVERY_STATUS];

export interface OptimisticMessage extends Message {
  status?: MessageDeliveryStatus;
  tempId?: string;
}

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

  if (error) throw error;
  return (data ?? []) as Message[];
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
  const { data, error } = await supabase.rpc('send_message', {
    // eslint-disable-next-line camelcase -- matches Postgres function parameter
    p_room_id: roomId,
    // eslint-disable-next-line camelcase -- matches Postgres function parameter
    p_content: content,
  });

  if (error) throw error;
  return data as Message;
};
