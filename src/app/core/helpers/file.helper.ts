export const sanitizeFilename = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9.-]+/g, '-');

export const ACCEPTED_IMAGE_MIME = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
] as const;

export type AcceptedImageMime = (typeof ACCEPTED_IMAGE_MIME)[number];

export const isAcceptedImage = (file: File): boolean =>
  (ACCEPTED_IMAGE_MIME as readonly string[]).includes(file.type);

export const ACCEPTED_AVATAR_MIME = ACCEPTED_IMAGE_MIME;
export const isAcceptedAvatar = isAcceptedImage;
export const ACCEPTED_CHAT_IMAGE_MIME = ACCEPTED_IMAGE_MIME;
export const isAcceptedChatImage = isAcceptedImage;

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB
export const MAX_CHAT_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
