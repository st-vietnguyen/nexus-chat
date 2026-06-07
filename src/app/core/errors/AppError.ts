import type { PostgrestError, AuthError } from '@supabase/supabase-js';

export type AppErrorCode =
  | 'auth'
  | 'forbidden'
  | 'not-found'
  | 'network'
  | 'rpc'
  | 'storage'
  | 'unknown';

/*
 * AppError is a wrapper around the built-in Error class that includes an error code and an optional cause.
 * The mapSupabaseError function converts errors from Supabase into AppError instances with appropriate codes based on the error context and content.
 * This allows for consistent error handling across the application, enabling components to react to specific error types (e.g., showing a login prompt on 'auth' errors or a "not found" message on 'not-found' errors).
 */
export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly cause?: unknown;

  constructor(code: AppErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.cause = cause;
  }
}

type SupabaseLikeError =
  | PostgrestError
  | AuthError
  | { message: string; code?: string };

export const mapSupabaseError = (
  error: SupabaseLikeError,
  context: 'rpc' | 'storage' | 'query' | 'auth' = 'query',
): AppError => {
  const message = error.message ?? 'Unknown error';
  const code = 'code' in error ? error.code : undefined;

  if (context === 'auth') return new AppError('auth', message, error);
  if (context === 'storage') return new AppError('storage', message, error);

  if (code === 'PGRST301' || code === '42501') {
    return new AppError('forbidden', message, error);
  }
  if (code === 'PGRST116') {
    return new AppError('not-found', message, error);
  }
  if (message.toLowerCase().includes('jwt')) {
    return new AppError('auth', message, error);
  }

  return new AppError(context === 'rpc' ? 'rpc' : 'unknown', message, error);
};
