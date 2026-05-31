/* eslint-disable camelcase -- snake_case keys match Supabase auth metadata schema */
import { supabase } from '@app/libs/supabase/client';

export interface SignUpExtras {
  displayName: string;
}

export const signInWithEmail = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password });

export const signUpWithEmail = (
  email: string,
  password: string,
  extras: SignUpExtras,
) =>
  supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: extras.displayName,
      },
    },
  });

export const signOut = () => supabase.auth.signOut();

export interface AuthUserMetadataPatch {
  display_name?: string;
  avatar_url?: string | null;
}

export const updateAuthUserMetadata = (data: AuthUserMetadataPatch) =>
  supabase.auth.updateUser({ data });

export const onAuthStateChange = (
  callback: Parameters<typeof supabase.auth.onAuthStateChange>[0],
) => supabase.auth.onAuthStateChange(callback);
