import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import {
  MESSAGE_DELIVERY_STATUS,
  type OptimisticMessage,
} from '@app/core/services/message.service';
import { MessageItem } from './MessageItem';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const baseMessage = (
  overrides: Partial<OptimisticMessage> = {},
): OptimisticMessage => ({
  id: 'm1',
  roomId: 'r1',
  senderId: 'u1',
  content: 'hi',
  createdAt: '2025-01-01T00:00:00.000Z',
  status: MESSAGE_DELIVERY_STATUS.SENT,
  ...overrides,
});

describe('MessageItem', () => {
  it('renders multi-line content with preserved newlines', () => {
    const message = baseMessage({ content: 'line1\nline2\nline3' });
    const { container } = render(<MessageItem message={message} isOwn />);

    // .message-bubble-text class is the CSS hook for `white-space: pre-wrap`.
    const text = container.querySelector('.message-bubble-text');
    expect(text?.textContent).toBe('line1\nline2\nline3');
  });
});
