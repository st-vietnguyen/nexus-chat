/* eslint-disable camelcase -- test fixtures mirror Postgres column names */
import { describe, expect, it } from 'vitest';
import {
  MESSAGE_DELIVERY_STATUS,
  type OptimisticMessage,
} from '@app/core/services/message.service';
import { reconcileIncomingMessage, sortPageDesc } from './reconcileMessages';

const baseMsg = (overrides: Partial<OptimisticMessage>): OptimisticMessage => ({
  id: 'real-1',
  room_id: 'room-1',
  sender_id: 'user-1',
  content: 'hello',
  created_at: '2026-05-29T12:00:00.000Z',
  status: MESSAGE_DELIVERY_STATUS.SENT,
  ...overrides,
});

describe('reconcileIncomingMessage', () => {
  it('dedupes when id is already present', () => {
    const existing = baseMsg({ id: 'msg-1' });
    const pages = [[existing]];
    const incoming = baseMsg({ id: 'msg-1', content: 'echoed' });

    const result = reconcileIncomingMessage(pages, incoming);

    expect(result).toBe(pages);
  });

  it('replaces matching SENDING temp with server message in place', () => {
    const temp: OptimisticMessage = baseMsg({
      id: 'temp-abc',
      tempId: 'temp-abc',
      status: MESSAGE_DELIVERY_STATUS.SENDING,
    });
    const otherSenderMsg = baseMsg({
      id: 'msg-other',
      sender_id: 'user-2',
      content: 'noise',
    });
    const pages = [[otherSenderMsg, temp]];

    const incoming = baseMsg({
      id: 'msg-real',
      created_at: '2026-05-29T12:00:01.000Z',
    });
    const [page] = reconcileIncomingMessage(pages, incoming);

    expect(page).toHaveLength(2);
    expect(page.find((m) => m.id === 'temp-abc')).toBeUndefined();
    const real = page.find((m) => m.id === 'msg-real');
    expect(real?.status).toBe(MESSAGE_DELIVERY_STATUS.SENT);
    // Page is re-sorted DESC.
    expect(new Date(page[0].created_at).getTime()).toBeGreaterThanOrEqual(
      new Date(page[1].created_at).getTime(),
    );
  });

  it('does not absorb a FAILED temp by content+sender (avoids hiding real failures)', () => {
    const failedTemp: OptimisticMessage = baseMsg({
      id: 'temp-xyz',
      tempId: 'temp-xyz',
      status: MESSAGE_DELIVERY_STATUS.FAILED,
    });
    const pages = [[failedTemp]];
    const incoming = baseMsg({ id: 'msg-real' });

    const [page] = reconcileIncomingMessage(pages, incoming);

    expect(page).toHaveLength(2);
    expect(page.some((m) => m.tempId === 'temp-xyz')).toBe(true);
    expect(page.some((m) => m.id === 'msg-real')).toBe(true);
  });

  it('prepends to newest page when no temp matches', () => {
    const pages = [
      [baseMsg({ id: 'old-1', created_at: '2026-05-29T11:00:00.000Z' })],
    ];
    const incoming = baseMsg({
      id: 'msg-real',
      created_at: '2026-05-29T12:00:00.000Z',
    });

    const [page] = reconcileIncomingMessage(pages, incoming);

    expect(page[0].id).toBe('msg-real');
    expect(page).toHaveLength(2);
  });

  it('handles empty pages safely', () => {
    const incoming = baseMsg({ id: 'msg-real' });
    const [page] = reconcileIncomingMessage([], incoming);
    expect(page).toEqual([incoming]);
  });
});

describe('sortPageDesc', () => {
  it('orders newest first by created_at', () => {
    const page = [
      baseMsg({ id: '1', created_at: '2026-05-29T10:00:00Z' }),
      baseMsg({ id: '2', created_at: '2026-05-29T12:00:00Z' }),
      baseMsg({ id: '3', created_at: '2026-05-29T11:00:00Z' }),
    ];
    expect(sortPageDesc(page).map((m) => m.id)).toEqual(['2', '3', '1']);
  });
});
