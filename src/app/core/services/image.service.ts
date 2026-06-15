import { supabase } from '@app/libs/supabase/client';
import { STORAGE_BUCKETS } from '@app/constants/supabase';
import {
  sanitizeFilename,
  isAcceptedChatImage,
  MAX_CHAT_IMAGE_BYTES,
} from '@core/helpers/file.helper';
import { mapSupabaseError } from '@core/errors/AppError';
import type { OptimisticMessage } from '@app/types/chat';

export class ImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageValidationError';
  }
}

export const validateChatImage = (file: File): void => {
  if (!isAcceptedChatImage(file)) {
    throw new ImageValidationError(
      `Unsupported file type: ${file.type}. Accepted: JPEG, PNG, WebP, GIF.`,
    );
  }
  if (file.size > MAX_CHAT_IMAGE_BYTES) {
    throw new ImageValidationError(
      `File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB (max 5 MB).`,
    );
  }
};

export const uploadChatImage = async (
  roomId: string,
  userId: string,
  file: File,
): Promise<string> => {
  validateChatImage(file);

  const safeName = sanitizeFilename(file.name);
  const path = `rooms/${roomId}/${userId}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.CHAT_IMAGES)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw mapSupabaseError(error, 'storage');

  return path;
};

export const getChatImagePublicUrl = (storagePath: string): string => {
  const { data } = supabase.storage
    .from(STORAGE_BUCKETS.CHAT_IMAGES)
    .getPublicUrl(storagePath);
  return data.publicUrl;
};

export const resolveMessageImageSrc = (
  message: OptimisticMessage,
): string | null => {
  if (message.localImageUrl) return message.localImageUrl;
  if (message.storagePath) return getChatImagePublicUrl(message.storagePath);
  return null;
};
