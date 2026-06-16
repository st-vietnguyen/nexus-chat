import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import IconClose from '@assets/icons/ic-close.svg?react';
import IconChevronLeft from '@assets/icons/ic-chevron-left.svg?react';
import IconChevronRight from '@assets/icons/ic-chevron-right.svg?react';
import type { PreviewImage } from '@app/shared/contexts/image-preview.context';

interface ImagePreviewModalProps {
  isOpen: boolean;
  images: PreviewImage[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const NavButton = ({
  direction,
  onClick,
  label,
}: {
  direction: 'prev' | 'next';
  onClick: () => void;
  label: string;
}) => {
  const Icon = direction === 'prev' ? IconChevronLeft : IconChevronRight;
  return (
    <button
      type="button"
      className={`image-preview-nav image-preview-nav-${direction}`}
      onClick={onClick}
      aria-label={label}
    >
      <Icon />
    </button>
  );
};

export const ImagePreviewModal = ({
  isOpen,
  images,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
}: ImagePreviewModalProps) => {
  const { t } = useTranslation('common');
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const handlersRef = useRef({ onClose, onNext, onPrevious });
  handlersRef.current = { onClose, onNext, onPrevious };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const { onClose, onNext, onPrevious } = handlersRef.current;
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onNext();
      else if (e.key === 'ArrowLeft') onPrevious();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    dialogRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || images.length < 2) return;
    const total = images.length;
    const nextIdx = (currentIndex + 1) % total;
    const prevIdx = (currentIndex - 1 + total) % total;
    // Preload next and previous images for smoother navigation
    [nextIdx, prevIdx].forEach((i) => {
      const url = images[i]?.url;
      if (!url) return;
      const img = new Image();
      img.src = url;
    });
  }, [isOpen, images, currentIndex]);

  const image = images[currentIndex] ?? null;
  if (!isOpen || !image) return null;

  const total = images.length;
  const hasMultiple = total > 1;

  return createPortal(
    <div
      className="image-preview-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="image-preview-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={image.alt ?? t('imagePreview.title')}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="image-preview-close"
          onClick={onClose}
          aria-label={t('imagePreview.close')}
        >
          <IconClose />
        </button>

        {hasMultiple && (
          <NavButton
            direction="prev"
            onClick={onPrevious}
            label={t('imagePreview.previous')}
          />
        )}

        <img
          src={image.url}
          alt={image.alt ?? t('imagePreview.title')}
          className="image-preview-img"
        />

        {hasMultiple && (
          <NavButton
            direction="next"
            onClick={onNext}
            label={t('imagePreview.next')}
          />
        )}

        {hasMultiple && (
          <div
            className="image-preview-counter"
            aria-live="polite"
            aria-atomic="true"
          >
            {t('imagePreview.counter', {
              current: currentIndex + 1,
              total,
            })}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};
