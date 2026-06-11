import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  MESSAGE_DELIVERY_STATUS,
  MESSAGE_TYPE,
  type OptimisticMessage,
} from '@app/core/services/message.service';
import { MessageItem } from './MessageItem';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@app/core/services/image.service', () => ({
  getChatImagePublicUrl: (path: string) => `https://storage.example/${path}`,
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
  type: MESSAGE_TYPE.TEXT,
  ...overrides,
});

describe('MessageItem — text bubble', () => {
  it('renders multi-line content with preserved newlines', () => {
    const message = baseMessage({ content: 'line1\nline2\nline3' });
    const { container } = render(<MessageItem message={message} isOwn />);

    const text = container.querySelector('.message-bubble-text');
    expect(text?.textContent).toBe('line1\nline2\nline3');
  });

  it('shows sending caption for own pending message', () => {
    const message = baseMessage({ status: MESSAGE_DELIVERY_STATUS.SENDING });
    render(<MessageItem message={message} isOwn />);

    expect(screen.getByRole('status')).toHaveTextContent('messages.sending');
  });

  it('shows retry button for own failed message with tempId', () => {
    const onRetry = vi.fn();
    const message = baseMessage({
      tempId: 'temp-1',
      status: MESSAGE_DELIVERY_STATUS.FAILED,
    });
    render(<MessageItem message={message} isOwn onRetry={onRetry} />);

    const btn = screen.getByRole('button', { name: 'messages.retry' });
    expect(btn).toBeInTheDocument();
  });
});

describe('MessageItem — image bubble', () => {
  it('renders image using localImageUrl for optimistic messages', () => {
    const message = baseMessage({
      type: MESSAGE_TYPE.IMAGE,
      content: '',
      localImageUrl: 'blob:http://localhost/abc',
      storagePath: 'rooms/r/u/file.jpg',
    });
    const { container } = render(<MessageItem message={message} isOwn />);

    const img = container.querySelector(
      '.message-image-bubble-img',
    ) as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe('blob:http://localhost/abc');
  });

  it('renders image using public URL when no localImageUrl', () => {
    const storagePath = 'rooms/r/u/photo.png';
    const message = baseMessage({
      type: MESSAGE_TYPE.IMAGE,
      content: '',
      storagePath,
    });
    const { container } = render(<MessageItem message={message} isOwn />);

    const img = container.querySelector(
      '.message-image-bubble-img',
    ) as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe(`https://storage.example/${storagePath}`);
  });

  it('shows placeholder when no src is available', () => {
    const message = baseMessage({
      type: MESSAGE_TYPE.IMAGE,
      content: '',
      storagePath: null,
    });
    const { container } = render(<MessageItem message={message} isOwn />);

    expect(
      container.querySelector('.message-image-bubble-placeholder'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('.message-image-bubble-img'),
    ).not.toBeInTheDocument();
  });

  it('applies pending class for sending image', () => {
    const message = baseMessage({
      type: MESSAGE_TYPE.IMAGE,
      content: '',
      status: MESSAGE_DELIVERY_STATUS.SENDING,
      localImageUrl: 'blob:http://localhost/xyz',
    });
    const { container } = render(<MessageItem message={message} isOwn />);

    expect(
      container.querySelector('.message-image-bubble-pending'),
    ).toBeInTheDocument();
  });

  it('shows retry for failed image message', () => {
    const onRetry = vi.fn();
    const message = baseMessage({
      type: MESSAGE_TYPE.IMAGE,
      content: '',
      tempId: 'temp-img',
      status: MESSAGE_DELIVERY_STATUS.FAILED,
      localImageUrl: 'blob:http://localhost/xyz',
    });
    render(<MessageItem message={message} isOwn onRetry={onRetry} />);

    expect(
      screen.getByRole('button', { name: 'messages.retry' }),
    ).toBeInTheDocument();
  });
});
