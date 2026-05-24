import type { RoomType } from '@app/types';

export const ROOM_TYPE = {
  DIRECT: 'direct',
  GROUP: 'group',
} as const satisfies Record<string, RoomType>;
