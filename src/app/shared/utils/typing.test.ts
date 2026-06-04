import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  TYPING_EXPIRY_MS,
  TYPING_THROTTLE_MS,
  acceptTypingEvent,
  removeTypingUser,
  shouldThrottleSend,
} from './typing';

afterEach(() => {
  vi.useRealTimers();
});

describe('acceptTypingEvent', () => {
  it('ignores events from self', () => {
    const result = acceptTypingEvent([], {
      fromUserId: 'me',
      selfUserId: 'me',
    });
    expect(result).toBeNull();
  });

  it('ignores empty fromUserId', () => {
    const result = acceptTypingEvent([], {
      fromUserId: '',
      selfUserId: 'me',
    });
    expect(result).toBeNull();
  });

  it('adds new peer to list', () => {
    const result = acceptTypingEvent(['a'], {
      fromUserId: 'b',
      selfUserId: 'me',
    });
    expect(result).toEqual(['a', 'b']);
  });

  it('keeps list stable when peer already present', () => {
    const prev = ['a'];
    const result = acceptTypingEvent(prev, {
      fromUserId: 'a',
      selfUserId: 'me',
    });
    expect(result).toBe(prev);
  });
});

describe('removeTypingUser', () => {
  it('removes the user id from the list', () => {
    expect(removeTypingUser(['a', 'b'], 'a')).toEqual(['b']);
  });
});

describe('shouldThrottleSend', () => {
  it('throttles when called inside the window', () => {
    expect(shouldThrottleSend(1000, 1500, 1000)).toBe(true);
  });

  it('allows send after the throttle window passes', () => {
    expect(shouldThrottleSend(1000, 2100, 1000)).toBe(false);
  });
});

describe('typing expiry semantics (simulated)', () => {
  it('expiry timer fires after TYPING_EXPIRY_MS to drop the user', () => {
    vi.useFakeTimers();
    let typing: string[] = ['peer-1'];

    const timer = setTimeout(() => {
      typing = removeTypingUser(typing, 'peer-1');
    }, TYPING_EXPIRY_MS);

    expect(typing).toEqual(['peer-1']);
    vi.advanceTimersByTime(TYPING_EXPIRY_MS - 1);
    expect(typing).toEqual(['peer-1']);
    vi.advanceTimersByTime(1);
    expect(typing).toEqual([]);

    clearTimeout(timer);
  });

  it('expiry > throttle window so steady typing keeps indicator alive', () => {
    expect(TYPING_EXPIRY_MS).toBeGreaterThan(TYPING_THROTTLE_MS);
  });
});
