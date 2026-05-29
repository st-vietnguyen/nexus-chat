import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import EmojiIcon from '@assets/icons/ic-emoji.svg?react';
import ImageIcon from '@assets/icons/ic-image.svg?react';
import AddCircleIcon from '@assets/icons/ic-add-circle.svg?react';
import SendIcon from '@assets/icons/ic-send.svg?react';

interface MessageComposeProps {
  onSend?: (content: string) => void;
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
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend?.(trimmed);
    setValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    // Ignore Enter while IME composition is in progress (Vietnamese Telex/VNI,
    // Japanese, Chinese, Korean). Without this guard, the IME-confirm Enter
    // submits in addition to the user's real submit, sending the message twice.
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    e.preventDefault();
    submit();
  };

  const canSend = value.trim().length > 0 && !disabled;

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
          <input
            ref={inputRef}
            type="text"
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
