import type { Database } from '@app/types/database';
import type {
  Message,
  Profile,
  Room,
  RoomMember,
  RoomListItem,
} from '@app/types/chat';

export type MessageRow = Database['public']['Tables']['messages']['Row'];
export type RoomRow = Database['public']['Tables']['rooms']['Row'];
export type RoomMemberRow = Database['public']['Tables']['room_members']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export const normalizeMessage = (row: MessageRow): Message => ({
  id: row.id,
  roomId: row.room_id,
  senderId: row.sender_id,
  content: row.content,
  createdAt: row.created_at,
});

export const normalizeMessages = (rows: MessageRow[]): Message[] =>
  rows.map(normalizeMessage);

export const normalizeRoom = (row: RoomRow): Room => ({
  id: row.id,
  name: row.name,
  type: row.type,
  avatarUrl: row.avatar_url,
  lastMessageAt: row.last_message_at,
  createdAt: row.created_at,
});

export const normalizeRoomMember = (row: RoomMemberRow): RoomMember => ({
  roomId: row.room_id,
  userId: row.user_id,
  joinedAt: row.joined_at,
  lastReadAt: row.last_read_at,
});

export const normalizeProfile = (row: ProfileRow): Profile => ({
  id: row.id,
  displayName: row.display_name,
  email: row.email,
  avatarUrl: row.avatar_url,
  createdAt: row.created_at,
});

export const normalizeProfiles = (rows: ProfileRow[]): Profile[] =>
  rows.map(normalizeProfile);

export interface RoomListItemInput {
  row: RoomRow;
  lastReadAt: string;
  unreadCount: number;
  lastMessagePreview: string | null;
}

export const normalizeRoomListItem = ({
  row,
  lastReadAt,
  unreadCount,
  lastMessagePreview,
}: RoomListItemInput): RoomListItem => ({
  ...normalizeRoom(row),
  lastReadAt,
  unreadCount,
  lastMessagePreview,
});
