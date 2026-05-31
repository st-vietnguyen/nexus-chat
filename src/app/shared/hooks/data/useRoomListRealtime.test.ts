import { describe, expect, it } from 'vitest';
import type { Message } from '@app/core/services/message.service';
import type { RoomListItem } from '@app/core/services/room.service';
import { applyMessageToRoomList } from './useRoomListRealtime';

const ROOM_A = 'room-a';
const ROOM_B = 'room-b';
const ME = 'user-self';
const PEER = 'user-peer';

const room = (overrides: Partial<RoomListItem>): RoomListItem => ({
  id: ROOM_A,
  type: 'direct',
  name: null,
  avatarUrl: null,
  createdAt: '2026-05-29T00:00:00Z',
  lastMessageAt: '2026-05-29T10:00:00Z',
  lastMessagePreview: 'previous',
  lastReadAt: '2026-05-29T10:00:00Z',
  unreadCount: 0,
  ...overrides,
});

const msg = (overrides: Partial<Message>): Message => ({
  id: 'm-1',
  roomId: ROOM_A,
  senderId: PEER,
  content: 'hi',
  createdAt: '2026-05-29T11:00:00Z',
  ...overrides,
});

describe('applyMessageToRoomList', () => {
  it('bumps unread count when peer messages an inactive room', () => {
    const rooms = [room({ id: ROOM_A, unreadCount: 0 })];
    const next = applyMessageToRoomList(rooms, msg({}), {
      activeRoomId: null,
      currentUserId: ME,
    });

    expect(next[0].unreadCount).toBe(1);
    expect(next[0].lastMessagePreview).toBe('hi');
  });

  it('does not bump unread for active room', () => {
    const rooms = [room({ id: ROOM_A })];
    const next = applyMessageToRoomList(rooms, msg({}), {
      activeRoomId: ROOM_A,
      currentUserId: ME,
    });

    expect(next[0].unreadCount).toBe(0);
  });

  it('does not bump unread when sender is self', () => {
    const rooms = [room({ id: ROOM_A })];
    const next = applyMessageToRoomList(rooms, msg({ senderId: ME }), {
      activeRoomId: null,
      currentUserId: ME,
    });

    expect(next[0].unreadCount).toBe(0);
  });

  it('hoists the updated room to the top of the list', () => {
    const rooms = [
      room({ id: ROOM_B, lastMessageAt: '2026-05-29T10:30:00Z' }),
      room({ id: ROOM_A }),
    ];
    const next = applyMessageToRoomList(rooms, msg({}), {
      activeRoomId: null,
      currentUserId: ME,
    });

    expect(next.map((r) => r.id)).toEqual([ROOM_A, ROOM_B]);
  });

  it('keeps preview unchanged for stale inserts but still bumps unread for peers', () => {
    const rooms = [
      room({
        id: ROOM_A,
        lastMessageAt: '2026-05-29T12:00:00Z',
        lastMessagePreview: 'newer',
        unreadCount: 1,
      }),
    ];
    const next = applyMessageToRoomList(
      rooms,
      msg({ createdAt: '2026-05-29T11:00:00Z', content: 'older' }),
      { activeRoomId: null, currentUserId: ME },
    );

    expect(next[0].lastMessagePreview).toBe('newer');
    expect(next[0].lastMessageAt).toBe('2026-05-29T12:00:00Z');
    expect(next[0].unreadCount).toBe(2);
  });

  it('returns input unchanged for stale inserts from self', () => {
    const rooms = [
      room({
        id: ROOM_A,
        lastMessageAt: '2026-05-29T12:00:00Z',
        unreadCount: 0,
      }),
    ];
    const next = applyMessageToRoomList(
      rooms,
      msg({
        senderId: ME,
        createdAt: '2026-05-29T11:00:00Z',
      }),
      { activeRoomId: null, currentUserId: ME },
    );

    expect(next).toBe(rooms);
  });

  it('returns input unchanged when room not in cache', () => {
    const rooms = [room({ id: ROOM_A })];
    const next = applyMessageToRoomList(rooms, msg({ roomId: 'unknown' }), {
      activeRoomId: null,
      currentUserId: ME,
    });

    expect(next).toBe(rooms);
  });
});
