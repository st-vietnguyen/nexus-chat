import { createClient } from '@supabase/supabase-js';
import type { Database } from '@app/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (import.meta.env.DEV) {
  if (!supabaseUrl) throw new Error('Missing env: VITE_SUPABASE_URL');
  if (!supabaseKey)
    throw new Error('Missing env: VITE_SUPABASE_PUBLISHABLE_KEY');
}

// Every Supabase HTTP call (PostgREST, auth token-refresh, realtime HTTP) goes
// through this wrapper. The bare fetch() has no built-in timeout: if the auth
// server accepts the TCP connection but stalls before sending a response,
// _callRefreshToken sets refreshingDeferred and never resolves it — causing all
// subsequent getSession() calls (and therefore every RPC / query) to hang
// indefinitely. Aborting after 10 s ensures the deferred is rejected and
// cleared so the next attempt starts fresh.
const fetchWithTimeout = (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  const callerSignal = init?.signal;
  const onCallerAbort = () => controller.abort();
  if (callerSignal) {
    if (callerSignal.aborted) controller.abort();
    else callerSignal.addEventListener('abort', onCallerAbort);
  }
  return fetch(input, { ...init, signal: controller.signal }).finally(() => {
    clearTimeout(timer);
    callerSignal?.removeEventListener('abort', onCallerAbort);
  });
};

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  global: { fetch: fetchWithTimeout },
});
