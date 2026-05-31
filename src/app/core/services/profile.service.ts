/* eslint-disable camelcase -- snake_case keys mirror Postgres columns */
import { supabase } from '@app/libs/supabase/client';
import {
  normalizeProfile,
  normalizeProfiles,
  type ProfileRow,
} from '@app/core/mappers/chat.mapper';
import { sanitizeFilename } from '@core/helpers/file.helper';
import { STORAGE_BUCKETS } from '@app/types';
import type { Profile } from '@app/types/chat';

export type { Profile } from '@app/types/chat';

export const getProfiles = async (
  excludeUserId: string,
): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, email, avatar_url, created_at, updated_at')
    .neq('id', excludeUserId)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) throw error;
  return normalizeProfiles((data ?? []) as ProfileRow[]);
};

export interface UploadAvatarResult {
  path: string;
  publicUrl: string;
}

export const uploadAvatar = async (
  userId: string,
  file: File,
): Promise<UploadAvatarResult> => {
  const path = `${userId}/${Date.now()}-${sanitizeFilename(file.name)}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.AVATARS)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from(STORAGE_BUCKETS.AVATARS)
    .getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
};

export interface UpdateProfileInput {
  id: string;
  displayName?: string;
  avatarUrl?: string | null;
}

export const updateProfile = async (
  input: UpdateProfileInput,
): Promise<Profile> => {
  const patch: {
    display_name?: string;
    avatar_url?: string | null;
  } = {};
  if (input.displayName !== undefined) patch.display_name = input.displayName;
  if (input.avatarUrl !== undefined) patch.avatar_url = input.avatarUrl;

  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', input.id)
    .select('id, display_name, email, avatar_url, created_at, updated_at')
    .single();

  if (error) throw error;
  return normalizeProfile(data as ProfileRow);
};
