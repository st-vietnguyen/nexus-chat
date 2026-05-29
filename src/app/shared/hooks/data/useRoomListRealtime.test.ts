/* eslint-disable camelcase -- test fixtures mirror Postgres column names */
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
  avatar_url: null,
  created_at: '2026-05-29T00:00:00Z',
  last_message_at: '2026-05-29T10:00:00Z',
  last_message_preview: 'previous',
  last_read_at: '2026-05-29T10:00:00Z',
  unread_count: 0,
  ...overrides,
});

const msg = (overrides: Partial<Message>): Message => ({
  id: 'm-1',
  room_id: ROOM_A,
  sender_id: PEER,
  content: 'hi',
  created_at: '2026-05-29T11:00:00Z',
  ...overrides,
});

describe('applyMessageToRoomList', () => {
  it('bumps unread count when peer messages an inactive room', () => {
    const rooms = [room({ id: ROOM_A, unread_count: 0 })];
    const next = applyMessageToRoomList(rooms, msg({}), {
      activeRoomId: null,
      currentUserId: ME,
    });

    expect(next[0].unread_count).toBe(1);
    expect(next[0].last_message_preview).toBe('hi');
  });

  it('does not bump unread for active room', () => {
    const rooms = [room({ id: ROOM_A })];
    const next = applyMessageToRoomList(rooms, msg({}), {
      activeRoomId: ROOM_A,
      currentUserId: ME,
    });

    expect(next[0].unread_count).toBe(0);
  });

  it('does not bump unread when sender is self', () => {
    const rooms = [room({ id: ROOM_A })];
    const next = applyMessageToRoomList(rooms, msg({ sender_id: ME }), {
      activeRoomId: null,
      currentUserId: ME,
    });

    expect(next[0].unread_count).toBe(0);
  });

  it('hoists the updated room to the top of the list', () => {
    const rooms = [
      room({ id: ROOM_B, last_message_at: '2026-05-29T10:30:00Z' }),
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
        last_message_at: '2026-05-29T12:00:00Z',
        last_message_preview: 'newer',
        unread_count: 1,
      }),
    ];
    const next = applyMessageToRoomList(
      rooms,
      msg({ created_at: '2026-05-29T11:00:00Z', content: 'older' }),
      { activeRoomId: null, currentUserId: ME },
    );

    expect(next[0].last_message_preview).toBe('newer');
    expect(next[0].last_message_at).toBe('2026-05-29T12:00:00Z');
    expect(next[0].unread_count).toBe(2);
  });

  it('returns input unchanged for stale inserts from self', () => {
    const rooms = [
      room({
        id: ROOM_A,
        last_message_at: '2026-05-29T12:00:00Z',
        unread_count: 0,
      }),
    ];
    const next = applyMessageToRoomList(
      rooms,
      msg({
        sender_id: ME,
        created_at: '2026-05-29T11:00:00Z',
      }),
      { activeRoomId: null, currentUserId: ME },
    );

    expect(next).toBe(rooms);
  });

  it('returns input unchanged when room not in cache', () => {
    const rooms = [room({ id: ROOM_A })];
    const next = applyMessageToRoomList(rooms, msg({ room_id: 'unknown' }), {
      activeRoomId: null,
      currentUserId: ME,
    });

    expect(next).toBe(rooms);
  });
});
