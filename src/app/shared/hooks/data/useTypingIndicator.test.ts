import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// vi.hoisted runs before any vi.mock factory, letting us share refs.
const {
  channelSend,
  channelOn,
  channelSubscribe,
  supabaseChannel,
  supabaseRemoveChannel,
} = vi.hoisted(() => {
  const send = vi.fn();
  const on = vi.fn();
  const subscribe = vi.fn();
  const mockChannel = { on, subscribe, send };
  on.mockReturnValue(mockChannel);
  subscribe.mockReturnValue(mockChannel);
  return {
    channelSend: send,
    channelOn: on,
    channelSubscribe: subscribe,
    supabaseChannel: vi.fn(() => mockChannel),
    supabaseRemoveChannel: vi.fn(),
  };
});

vi.mock('@app/libs/supabase/client', () => ({
  supabase: {
    channel: supabaseChannel,
    removeChannel: supabaseRemoveChannel,
  },
}));

vi.mock('@app/shared/contexts/auth.context', () => ({
  useAuth: () => ({
    user: { id: 'me' },
    isAuthenticated: true,
    isLoading: false,
    clearUserSession: vi.fn(),
  }),
}));

import { useTypingIndicator } from './useTypingIndicator';

beforeEach(() => {
  channelSend.mockClear();
  channelOn.mockClear();
  channelSubscribe.mockClear();
  supabaseChannel.mockClear();
  supabaseRemoveChannel.mockClear();
});

describe('useTypingIndicator', () => {
  it('does not subscribe when roomId is missing', () => {
    const { result } = renderHook(() => useTypingIndicator(null));
    expect(supabaseChannel).not.toHaveBeenCalled();
    expect(result.current.typingUserIds).toEqual([]);

    // notifyTyping is a safe no-op without a channel.
    act(() => result.current.notifyTyping());
    expect(channelSend).not.toHaveBeenCalled();
  });

  it('subscribes once per roomId and tears down on unmount', () => {
    const { unmount } = renderHook(() => useTypingIndicator('room-1'));
    expect(supabaseChannel).toHaveBeenCalledTimes(1);
    expect(supabaseChannel).toHaveBeenCalledWith(
      'room-typing:room-1',
      expect.objectContaining({
        config: { broadcast: { self: false } },
      }),
    );
    expect(channelSubscribe).toHaveBeenCalledTimes(1);

    unmount();
    expect(supabaseRemoveChannel).toHaveBeenCalledTimes(1);
  });

  it('throttles consecutive notifyTyping calls', () => {
    const { result } = renderHook(() => useTypingIndicator('room-1'));

    act(() => result.current.notifyTyping());
    act(() => result.current.notifyTyping()); // throttled
    expect(channelSend).toHaveBeenCalledTimes(1);
  });
});
