export const sanitizeFilename = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9.-]+/g, '-');

export const ACCEPTED_AVATAR_MIME = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
] as const;

export type AcceptedAvatarMime = (typeof ACCEPTED_AVATAR_MIME)[number];

// SVG explicitly disallowed: can execute JS via embedded <script>/event handlers.
export const isAcceptedAvatar = (file: File): boolean =>
  (ACCEPTED_AVATAR_MIME as readonly string[]).includes(file.type);

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
