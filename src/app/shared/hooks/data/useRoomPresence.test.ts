import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

const {
  channelOn,
  channelSubscribe,
  channelTrack,
  channelUntrack,
  channelPresenceState,
  supabaseChannel,
  supabaseRemoveChannel,
} = vi.hoisted(() => {
  const on = vi.fn();
  const subscribe = vi.fn();
  const track = vi.fn(() => Promise.resolve());
  const untrack = vi.fn(() => Promise.resolve());
  const presenceState = vi.fn(() => ({}));
  const mockChannel = { on, subscribe, track, untrack, presenceState };
  on.mockReturnValue(mockChannel);
  subscribe.mockReturnValue(mockChannel);
  return {
    channelOn: on,
    channelSubscribe: subscribe,
    channelTrack: track,
    channelUntrack: untrack,
    channelPresenceState: presenceState,
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
  useAuth: () => ({ user: { id: 'me' } }),
}));

import { useRoomPresence } from './useRoomPresence';

beforeEach(() => {
  channelOn.mockClear();
  channelSubscribe.mockClear();
  channelTrack.mockClear();
  channelUntrack.mockClear();
  channelPresenceState.mockReturnValue({});
  supabaseChannel.mockClear();
  supabaseRemoveChannel.mockClear();
});

describe('useRoomPresence', () => {
  it('does not subscribe when roomId is missing', () => {
    const { result } = renderHook(() => useRoomPresence(null));
    expect(supabaseChannel).not.toHaveBeenCalled();
    expect(result.current.onlineUserIds).toEqual([]);
  });

  it('subscribes to a per-room presence channel with the user as key', () => {
    renderHook(() => useRoomPresence('room-1'));
    expect(supabaseChannel).toHaveBeenCalledWith(
      'room-presence:room-1',
      expect.objectContaining({ config: { presence: { key: 'me' } } }),
    );
  });

  it('removes the channel on unmount', () => {
    const { unmount } = renderHook(() => useRoomPresence('room-1'));
    unmount();
    expect(supabaseRemoveChannel).toHaveBeenCalledTimes(1);
  });
});
