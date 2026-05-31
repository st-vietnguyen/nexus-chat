import { useTranslation } from 'react-i18next';
import AlertErrorIcon from '@assets/icons/ic-alert-error.svg?react';

const AppErrorBoundaryFallback = ({ error, resetErrorBoundary }) => {
  const { t } = useTranslation('common');
  return (
    <div className="pages-container">
      <AlertErrorIcon className="error-icon" />
      <h2 className="txt-bold">{t('errors.boundaryTitle')}</h2>
      <p className="error-message">{error.message}</p>
      <button onClick={resetErrorBoundary} className="btn btn-primary">
        {t('errors.retry')}
      </button>
    </div>
  );
};

export default AppErrorBoundaryFallback;
