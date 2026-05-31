import type { RoomType } from './database';

export const MESSAGE_DELIVERY_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  FAILED: 'failed',
} as const;

export type MessageDeliveryStatus =
  (typeof MESSAGE_DELIVERY_STATUS)[keyof typeof MESSAGE_DELIVERY_STATUS];

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface OptimisticMessage extends Message {
  status?: MessageDeliveryStatus;
  tempId?: string;
}

export interface Room {
  id: string;
  name: string | null;
  type: RoomType;
  avatarUrl: string | null;
  lastMessageAt: string | null;
  createdAt: string;
}

export interface RoomMember {
  roomId: string;
  userId: string;
  joinedAt: string;
  lastReadAt: string;
}

export interface RoomListItem extends Room {
  lastMessagePreview?: string | null;
  lastReadAt: string;
  unreadCount: number;
}

export interface Profile {
  id: string;
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
  createdAt: string;
}
