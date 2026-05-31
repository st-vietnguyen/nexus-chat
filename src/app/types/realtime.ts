import type { TABLES } from '@app/constants/supabase';

export const REALTIME_EVENT = {
  INSERT: 'INSERT',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
} as const;

export type RealtimeEvent =
  (typeof REALTIME_EVENT)[keyof typeof REALTIME_EVENT];

export type DbTable = (typeof TABLES)[keyof typeof TABLES];
