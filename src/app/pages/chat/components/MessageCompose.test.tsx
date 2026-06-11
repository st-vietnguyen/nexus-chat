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

// ---------------------------------------------------------------------------
// Image send tests
// ---------------------------------------------------------------------------

const makeImageFile = (name = 'photo.jpg', type = 'image/jpeg') =>
  new File([new Uint8Array(1024)], name, { type });

const getFileInput = () =>
  document.querySelector('input[type="file"]') as HTMLInputElement;

describe('MessageCompose — image upload', () => {
  it('shows image preview after file selection', async () => {
    render(<MessageCompose onSend={vi.fn()} onSendImage={vi.fn()} />);

    const file = makeImageFile();
    Object.defineProperty(getFileInput(), 'files', {
      value: [file],
      writable: false,
    });
    fireEvent.change(getFileInput());

    await waitFor(() =>
      expect(screen.getByAltText('photo.jpg')).toBeInTheDocument(),
    );
  });

  it('shows previews for multiple selected files', async () => {
    render(<MessageCompose onSend={vi.fn()} onSendImage={vi.fn()} />);

    const file1 = makeImageFile('a.jpg');
    const file2 = makeImageFile('b.png', 'image/png');
    Object.defineProperty(getFileInput(), 'files', {
      value: [file1, file2],
      writable: false,
    });
    fireEvent.change(getFileInput());

    await waitFor(() => {
      expect(screen.getByAltText('a.jpg')).toBeInTheDocument();
      expect(screen.getByAltText('b.png')).toBeInTheDocument();
    });
  });

  it('removes individual image preview when its remove button is clicked', async () => {
    render(<MessageCompose onSend={vi.fn()} onSendImage={vi.fn()} />);

    const file1 = makeImageFile('a.jpg');
    const file2 = makeImageFile('b.png', 'image/png');
    Object.defineProperty(getFileInput(), 'files', {
      value: [file1, file2],
      writable: false,
    });
    fireEvent.change(getFileInput());

    await waitFor(() =>
      expect(screen.getByAltText('a.jpg')).toBeInTheDocument(),
    );

    // Click the first remove button (removes a.jpg)
    const removeButtons = screen.getAllByLabelText('compose.removeImage');
    fireEvent.click(removeButtons[0]);

    await waitFor(() =>
      expect(screen.queryByAltText('a.jpg')).not.toBeInTheDocument(),
    );
    expect(screen.getByAltText('b.png')).toBeInTheDocument();
  });

  it('calls onSendImage once per image when multiple images selected', async () => {
    const onSend = vi.fn();
    const onSendImage = vi.fn();
    render(<MessageCompose onSend={onSend} onSendImage={onSendImage} />);

    const file1 = makeImageFile('a.jpg');
    const file2 = makeImageFile('b.png', 'image/png');
    Object.defineProperty(getFileInput(), 'files', {
      value: [file1, file2],
      writable: false,
    });
    fireEvent.change(getFileInput());

    await waitFor(() =>
      expect(screen.getByAltText('a.jpg')).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByLabelText('compose.send'));

    await waitFor(() => expect(onSendImage).toHaveBeenCalledTimes(2));
    expect(onSendImage).toHaveBeenCalledWith(file1);
    expect(onSendImage).toHaveBeenCalledWith(file2);
    expect(onSend).not.toHaveBeenCalled();
  });

  it('calls onSendImage (not onSend) when single image selected and send clicked', async () => {
    const onSend = vi.fn();
    const onSendImage = vi.fn();
    render(<MessageCompose onSend={onSend} onSendImage={onSendImage} />);

    const file = makeImageFile();
    Object.defineProperty(getFileInput(), 'files', {
      value: [file],
      writable: false,
    });
    fireEvent.change(getFileInput());

    await waitFor(() =>
      expect(screen.getByAltText('photo.jpg')).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByLabelText('compose.send'));

    await waitFor(() => expect(onSendImage).toHaveBeenCalledWith(file));
    expect(onSend).not.toHaveBeenCalled();
  });

  it('does not send when no image and no text', () => {
    const onSend = vi.fn();
    const onSendImage = vi.fn();
    render(<MessageCompose onSend={onSend} onSendImage={onSendImage} />);

    fireEvent.click(screen.getByLabelText('compose.send'));

    expect(onSend).not.toHaveBeenCalled();
    expect(onSendImage).not.toHaveBeenCalled();
  });

  it('text send still works when no image is selected', () => {
    const onSend = vi.fn();
    render(<MessageCompose onSend={onSend} onSendImage={vi.fn()} />);

    typeIn(getTextarea(), 'hello image test');
    fireEvent.keyDown(getTextarea(), { key: 'Enter' });

    expect(onSend).toHaveBeenCalledWith('hello image test');
  });
});
