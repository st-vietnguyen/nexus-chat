export const REALTIME_EVENT = {
  INSERT: 'INSERT',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
} as const;

export type RealtimeEvent =
  (typeof REALTIME_EVENT)[keyof typeof REALTIME_EVENT];

export const DB_TABLE = {
  ROOMS: 'rooms',
  ROOM_MEMBERS: 'room_members',
  MESSAGES: 'messages',
  PROFILES: 'profiles',
} as const;

export type DbTable = (typeof DB_TABLE)[keyof typeof DB_TABLE];
