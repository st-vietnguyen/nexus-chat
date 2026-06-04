import { useState, useRef, useLayoutEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import EmojiIcon from '@assets/icons/ic-emoji.svg?react';
import ImageIcon from '@assets/icons/ic-image.svg?react';
import AddCircleIcon from '@assets/icons/ic-add-circle.svg?react';
import SendIcon from '@assets/icons/ic-send.svg?react';

interface MessageComposeProps {
  onSend?: (content: string) => void | Promise<unknown>;
  onTyping?: () => void;
  disabled?: boolean;
}

export const MessageCompose = ({
  onSend,
  onTyping,
  disabled,
}: MessageComposeProps) => {
  const { t } = useTranslation('chat');
  const [value, setValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendingRef = useRef(false);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const submit = useCallback(async () => {
    if (sendingRef.current || disabled) return;
    const trimmed = value.trim();
    if (!trimmed) return;

    sendingRef.current = true;
    setIsSending(true);
    try {
      await onSend?.(trimmed);
      setValue('');
    } finally {
      sendingRef.current = false;
      setIsSending(false);
      textareaRef.current?.focus();
    }
  }, [disabled, onSend, value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter') return;
    // IME-confirm Enter (Telex/VNI, Japanese/Chinese/Korean) would double-submit.
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.shiftKey) return;
    e.preventDefault();
    if (e.repeat) return;
    void submit();
  };

  const canSend = value.trim().length > 0 && !disabled && !isSending;

  return (
    <footer className="message-compose">
      <div className="message-compose-form">
        <div className="message-compose-actions">
          <button
            type="button"
            className="message-compose-action-btn"
            aria-label={t('compose.emoji')}
          >
            <EmojiIcon />
          </button>
          <button
            type="button"
            className="message-compose-action-btn"
            aria-label={t('compose.image')}
          >
            <ImageIcon />
          </button>
          <button
            type="button"
            className="message-compose-action-btn"
            aria-label={t('compose.attach')}
          >
            <AddCircleIcon />
          </button>
        </div>

        <div className="message-compose-input-wrap">
          <textarea
            ref={textareaRef}
            rows={1}
            className="message-compose-input"
            placeholder={t('compose.placeholder')}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (e.target.value.length > 0) onTyping?.();
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-label={t('compose.placeholder')}
          />
        </div>

        <button
          type="button"
          className={`message-compose-send${canSend ? ' message-compose-send-active' : ''}`}
          aria-label={t('compose.send')}
          disabled={!canSend}
          onClick={submit}
        >
          <SendIcon />
        </button>
      </div>
    </footer>
  );
};
