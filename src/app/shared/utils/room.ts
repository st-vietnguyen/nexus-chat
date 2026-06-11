import { MESSAGE_TYPE, type Message } from '@app/core/services/message.service';
import type { RoomListItem } from '@app/core/services/room.service';
import i18n from '@app/core/services/i18n.service';

export interface ApplyMessageOptions {
  activeRoomId?: string | null;
  currentUserId: string;
}

export const applyMessageToRoomList = (
  rooms: RoomListItem[],
  message: Message,
  { activeRoomId, currentUserId }: ApplyMessageOptions,
): RoomListItem[] => {
  const idx = rooms.findIndex((r) => r.id === message.roomId);
  if (idx === -1) return rooms;

  const existing = rooms[idx];
  const incomingTime = new Date(message.createdAt).getTime();
  const existingTime = existing.lastMessageAt
    ? new Date(existing.lastMessageAt).getTime()
    : 0;
  // Stale arrivals (older than the cached preview) should still bump unread
  // for peer messages — the count tracks "how many messages since last read",
  // not "did the newest preview change". Only suppress the preview/hoist.
  const isStale = incomingTime <= existingTime;

  const isOwn = message.senderId === currentUserId;
  const isActive = activeRoomId === message.roomId;
  const nextUnread =
    isOwn || isActive ? existing.unreadCount : existing.unreadCount + 1;

  if (isStale) {
    if (nextUnread === existing.unreadCount) return rooms;
    const updated: RoomListItem = {
      ...existing,
      unreadCount: Math.max(0, nextUnread),
    };
    return rooms.map((r, i) => (i === idx ? updated : r));
  }

  const updated: RoomListItem = {
    ...existing,
    lastMessageAt: message.createdAt,
    lastMessagePreview:
      message.type === MESSAGE_TYPE.IMAGE
        ? i18n.t('chat:messages.imagePreview')
        : message.content,
    unreadCount: Math.max(0, nextUnread),
  };

  return [updated, ...rooms.slice(0, idx), ...rooms.slice(idx + 1)];
};
