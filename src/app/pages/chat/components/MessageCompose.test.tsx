import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MessageCompose } from './MessageCompose';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const getTextarea = () =>
  screen.getByLabelText('compose.placeholder') as HTMLTextAreaElement;

const typeIn = (el: HTMLTextAreaElement, value: string) => {
  fireEvent.change(el, { target: { value } });
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('MessageCompose', () => {
  it('sends on Enter with trimmed outer whitespace, preserves internal newlines', () => {
    const onSend = vi.fn();
    render(<MessageCompose onSend={onSend} />);
    const ta = getTextarea();

    typeIn(ta, '  hello\nworld  ');
    fireEvent.keyDown(ta, { key: 'Enter' });

    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledWith('hello\nworld');
  });

  it('Shift+Enter inserts newline and does not send', () => {
    const onSend = vi.fn();
    render(<MessageCompose onSend={onSend} />);
    const ta = getTextarea();

    typeIn(ta, 'hello');
    fireEvent.keyDown(ta, { key: 'Enter', shiftKey: true });

    expect(onSend).not.toHaveBeenCalled();
  });

  it('does not send whitespace/newline-only content', () => {
    const onSend = vi.fn();
    render(<MessageCompose onSend={onSend} />);
    const ta = getTextarea();

    typeIn(ta, '   \n  \n');
    fireEvent.keyDown(ta, { key: 'Enter' });

    expect(onSend).not.toHaveBeenCalled();
  });

  it('does not send empty content', () => {
    const onSend = vi.fn();
    render(<MessageCompose onSend={onSend} />);
    const ta = getTextarea();

    fireEvent.keyDown(ta, { key: 'Enter' });

    expect(onSend).not.toHaveBeenCalled();
  });

  it('blocks duplicate sends while isSending (slow onSend)', async () => {
    let resolveSend: (() => void) | undefined;
    const onSend = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSend = () => resolve();
        }),
    );

    render(<MessageCompose onSend={onSend} />);
    const ta = getTextarea();

    typeIn(ta, 'hi');
    fireEvent.keyDown(ta, { key: 'Enter' });
    fireEvent.keyDown(ta, { key: 'Enter' });
    fireEvent.keyDown(ta, { key: 'Enter' });

    expect(onSend).toHaveBeenCalledTimes(1);

    (resolveSend as (() => void) | undefined)?.();
    await waitFor(() => expect(ta.value).toBe(''));
  });

  it('ignores Enter triggered by IME composition', () => {
    const onSend = vi.fn();
    render(<MessageCompose onSend={onSend} />);
    const ta = getTextarea();

    typeIn(ta, 'こん');
    // happy-dom does not set isComposing; simulate via keyCode 229.
    fireEvent.keyDown(ta, { key: 'Enter', keyCode: 229 });

    expect(onSend).not.toHaveBeenCalled();
  });

  it('does not send when disabled', () => {
    const onSend = vi.fn();
    render(<MessageCompose onSend={onSend} disabled />);
    const ta = getTextarea();

    typeIn(ta, 'hello');
    fireEvent.keyDown(ta, { key: 'Enter' });

    expect(onSend).not.toHaveBeenCalled();
  });

  it('send button triggers send', () => {
    const onSend = vi.fn();
    render(<MessageCompose onSend={onSend} />);
    const ta = getTextarea();

    typeIn(ta, 'hello');
    fireEvent.click(screen.getByLabelText('compose.send'));

    expect(onSend).toHaveBeenCalledWith('hello');
  });
});
