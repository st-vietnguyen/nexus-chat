import type { TABLES } from '@app/constants/supabase';

export const REALTIME_EVENT = {
  INSERT: 'INSERT',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
} as const;

export type RealtimeEvent =
  (typeof REALTIME_EVENT)[keyof typeof REALTIME_EVENT];

export type DbTable = (typeof TABLES)[keyof typeof TABLES];

export const REALTIME_SUBSCRIBE_STATES = {
  SUBSCRIBED: 'SUBSCRIBED',
  TIMED_OUT: 'TIMED_OUT',
  ERROR: 'ERROR',
} as const;

export type RealtimeSubscribeState =
  (typeof REALTIME_SUBSCRIBE_STATES)[keyof typeof REALTIME_SUBSCRIBE_STATES];
