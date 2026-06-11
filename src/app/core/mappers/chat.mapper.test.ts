/* eslint-disable camelcase -- test fixtures mirror Postgres column names */
import { describe, expect, it } from 'vitest';
import {
  normalizeMessage,
  normalizeProfile,
  normalizeRoom,
  normalizeRoomListItem,
  normalizeRoomMember,
  type MessageRow,
  type ProfileRow,
  type RoomMemberRow,
  type RoomRow,
} from './chat.mapper';

const baseMessageRow = (): MessageRow => ({
  id: 'm-1',
  room_id: 'r-1',
  sender_id: 'u-1',
  content: 'hi',
  created_at: '2026-05-29T12:00:00Z',
  type: 'text',
  storage_path: null,
  file_name: null,
  file_size: null,
  mime_type: null,
});

describe('normalizeMessage', () => {
  it('converts snake_case columns to camelCase fields for text message', () => {
    expect(normalizeMessage(baseMessageRow())).toEqual({
      id: 'm-1',
      roomId: 'r-1',
      senderId: 'u-1',
      content: 'hi',
      createdAt: '2026-05-29T12:00:00Z',
      type: 'text',
      storagePath: null,
      fileName: null,
      fileSize: null,
      mimeType: null,
    });
  });

  it('defaults content to empty string when null (image message)', () => {
    const row: MessageRow = {
      ...baseMessageRow(),
      content: null,
      type: 'image',
      storage_path: 'rooms/r-1/u-1/123-img.jpg',
      file_name: 'img.jpg',
      file_size: 10240,
      mime_type: 'image/jpeg',
    };

    const result = normalizeMessage(row);

    expect(result.content).toBe('');
    expect(result.type).toBe('image');
    expect(result.storagePath).toBe('rooms/r-1/u-1/123-img.jpg');
    expect(result.fileName).toBe('img.jpg');
    expect(result.fileSize).toBe(10240);
    expect(result.mimeType).toBe('image/jpeg');
  });

  it('defaults type to "text" when row.type is missing', () => {
    // Simulates rows inserted before the migration
    const row = { ...baseMessageRow(), type: undefined as unknown as 'text' };
    expect(normalizeMessage(row).type).toBe('text');
  });
});

describe('normalizeRoom', () => {
  it('converts snake_case columns to camelCase fields', () => {
    const row: RoomRow = {
      id: 'r-1',
      name: 'team',
      type: 'group',
      avatar_url: 'http://x/y.png',
      last_message_at: '2026-05-29T12:00:00Z',
      created_at: '2026-05-29T00:00:00Z',
    };

    expect(normalizeRoom(row)).toEqual({
      id: 'r-1',
      name: 'team',
      type: 'group',
      avatarUrl: 'http://x/y.png',
      lastMessageAt: '2026-05-29T12:00:00Z',
      createdAt: '2026-05-29T00:00:00Z',
    });
  });
});

describe('normalizeRoomMember', () => {
  it('converts snake_case to camelCase', () => {
    const row: RoomMemberRow = {
      room_id: 'r-1',
      user_id: 'u-1',
      joined_at: '2026-05-29T00:00:00Z',
      last_read_at: '2026-05-29T12:00:00Z',
    };

    expect(normalizeRoomMember(row)).toEqual({
      roomId: 'r-1',
      userId: 'u-1',
      joinedAt: '2026-05-29T00:00:00Z',
      lastReadAt: '2026-05-29T12:00:00Z',
    });
  });
});

describe('normalizeProfile', () => {
  it('converts snake_case to camelCase', () => {
    const row: ProfileRow = {
      id: 'u-1',
      display_name: 'Alice',
      email: 'a@x',
      avatar_url: 'http://x/a.png',
      created_at: '2026-05-29T00:00:00Z',
      updated_at: '2026-05-29T00:00:00Z',
    };

    expect(normalizeProfile(row)).toEqual({
      id: 'u-1',
      displayName: 'Alice',
      email: 'a@x',
      avatarUrl: 'http://x/a.png',
      createdAt: '2026-05-29T00:00:00Z',
    });
  });
});

describe('normalizeRoomListItem', () => {
  it('merges client-side fields with normalized room row', () => {
    const row: RoomRow = {
      id: 'r-1',
      name: null,
      type: 'direct',
      avatar_url: null,
      last_message_at: '2026-05-29T12:00:00Z',
      created_at: '2026-05-29T00:00:00Z',
    };

    expect(
      normalizeRoomListItem({
        row,
        lastReadAt: '2026-05-29T11:00:00Z',
        unreadCount: 3,
        lastMessagePreview: 'hi',
      }),
    ).toEqual({
      id: 'r-1',
      name: null,
      type: 'direct',
      avatarUrl: null,
      lastMessageAt: '2026-05-29T12:00:00Z',
      createdAt: '2026-05-29T00:00:00Z',
      lastReadAt: '2026-05-29T11:00:00Z',
      unreadCount: 3,
      lastMessagePreview: 'hi',
    });
  });
});
