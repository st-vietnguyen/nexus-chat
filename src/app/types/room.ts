import type { RoomType } from './database';

export const ROOM_TYPE = {
  DIRECT: 'direct',
  GROUP: 'group',
} as const satisfies Record<string, RoomType>;
