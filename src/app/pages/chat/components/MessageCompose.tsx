import {
  useState,
  useRef,
  useLayoutEffect,
  useCallback,
  useEffect,
} from 'react';
import { useTranslation } from 'react-i18next';
import EmojiIcon from '@assets/icons/ic-emoji.svg?react';
import ImageIcon from '@assets/icons/ic-image.svg?react';
import AddCircleIcon from '@assets/icons/ic-add-circle.svg?react';
import SendIcon from '@assets/icons/ic-send.svg?react';
import CloseIcon from '@assets/icons/ic-close.svg?react';
import { Button } from '@app/shared/components/partials';
import {
  ACCEPTED_CHAT_IMAGE_MIME,
  MAX_CHAT_IMAGE_BYTES,
} from '@core/helpers/file.helper';

interface MessageComposeProps {
  onSend?: (content: string) => void | Promise<unknown>;
  onSendImage?: (file: File) => void | Promise<unknown>;
  onTyping?: () => void;
  disabled?: boolean;
}

export const MessageCompose = ({
  onSend,
  onSendImage,
  onTyping,
  disabled,
}: MessageComposeProps) => {
  const { t } = useTranslation('chat');
  const [value, setValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendingRef = useRef(false);
  const previewUrlsRef = useRef<string[]>([]);
  previewUrlsRef.current = previewUrls;

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const clearImages = useCallback(() => {
    setPreviewUrls((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
    setSelectedImages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const removeImage = useCallback((index: number) => {
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (!files.length) return;

      e.target.value = '';

      const newUrls = files.map((f) => URL.createObjectURL(f));
      setSelectedImages((prev) => [...prev, ...files]);
      setPreviewUrls((prev) => [...prev, ...newUrls]);
      textareaRef.current?.focus();
    },
    [],
  );

  const submit = useCallback(async () => {
    if (sendingRef.current || disabled) return;

    if (selectedImages.length > 0) {
      if (!onSendImage) return;
      sendingRef.current = true;
      setIsSending(true);
      try {
        await Promise.all(selectedImages.map((file) => onSendImage(file)));
        clearImages();
      } finally {
        sendingRef.current = false;
        setIsSending(false);
        textareaRef.current?.focus();
      }
      return;
    }

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
  }, [disabled, onSend, onSendImage, value, selectedImages, clearImages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter') return;
    // IME-confirm Enter (Telex/VNI, Japanese/Chinese/Korean) would double-submit.
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.shiftKey) return;
    e.preventDefault();
    if (e.repeat) return;
    void submit();
  };

  const canSend =
    (selectedImages.length > 0 || value.trim().length > 0) &&
    !disabled &&
    !isSending;

  const acceptAttr = ACCEPTED_CHAT_IMAGE_MIME.join(',');

  return (
    <footer className="message-compose">
      {selectedImages.length > 0 && (
        <div className="message-compose-image-preview">
          {selectedImages.map((file, index) => (
            <div
              key={previewUrls[index]}
              className="message-compose-image-preview-item"
            >
              <div className="message-compose-image-preview-inner">
                <img
                  src={previewUrls[index]}
                  alt={file.name}
                  className="message-compose-image-preview-img"
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="message-compose-image-preview-remove"
                  onClick={() => removeImage(index)}
                  isDisabled={isSending}
                >
                  <CloseIcon />
                </Button>
              </div>
              {file.size > MAX_CHAT_IMAGE_BYTES && (
                <span className="message-compose-image-preview-error">
                  {t('compose.imageTooLarge')}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="message-compose-form">
        <div className="message-compose-actions">
          <Button
            type="button"
            variant="ghost"
            className="message-compose-action-btn"
          >
            <EmojiIcon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="message-compose-action-btn"
            onClick={() => fileInputRef.current?.click()}
            isDisabled={disabled || isSending}
          >
            <ImageIcon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="message-compose-action-btn"
          >
            <AddCircleIcon />
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptAttr}
          multiple
          className="message-compose-file-input"
          tabIndex={-1}
          onChange={handleImageSelect}
        />

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
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          className={`message-compose-send${canSend ? ' message-compose-send-active' : ''}`}
          isDisabled={!canSend}
          onClick={submit}
        >
          <SendIcon />
        </Button>
      </div>
    </footer>
  );
};
