import { useTranslation } from 'react-i18next';

interface TypingIndicatorProps {
  count: number;
}

export const TypingIndicator = ({ count }: TypingIndicatorProps) => {
  const { t } = useTranslation('chat');
  if (count <= 0) return null;

  const label = count === 1 ? t('typing.one') : t('typing.many', { count });

  return (
    <div className="typing-indicator">
      <span className="typing-indicator-dots" aria-hidden="true">
        <span className="typing-indicator-dot" />
        <span className="typing-indicator-dot" />
        <span className="typing-indicator-dot" />
      </span>
      <span className="typing-indicator-text">{label}</span>
    </div>
  );
};
