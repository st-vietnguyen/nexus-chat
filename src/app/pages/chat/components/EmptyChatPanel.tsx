import { useTranslation } from 'react-i18next';
import { Typography } from '@app/shared/components/partials';
import ForumIcon from '@assets/icons/ic-forum.svg?react';
import FavoriteIcon from '@assets/icons/ic-favorite.svg?react';

export const EmptyChatPanel = () => {
  const { t } = useTranslation('chat');

  return (
    <section className="chat-panel chat-panel-empty">
      <div className="chat-panel-bubble chat-panel-bubble-top" aria-hidden />
      <div className="chat-panel-bubble chat-panel-bubble-bottom" aria-hidden />
      <div className="chat-panel-content">
        <div className="chat-panel-card">
          <ForumIcon className="chat-panel-card-icon" />
          <span
            className="chat-panel-card-dot chat-panel-card-dot-pink"
            aria-hidden
          >
            <FavoriteIcon />
          </span>
          <span
            className="chat-panel-card-dot chat-panel-card-dot-magenta"
            aria-hidden
          />
        </div>
        <Typography variant="h2" align="center">
          {t('emptyPanel.heading')}
        </Typography>
        <Typography variant="body-lg" align="center" color="text-secondary">
          {t('emptyPanel.subtitle')}
        </Typography>
      </div>
    </section>
  );
};
