import React from 'react';
import { useTranslation } from 'react-i18next';

const Home = (): JSX.Element => {
  const { t } = useTranslation('common');
  return (
    <div>{t('pages.homepage')}</div>
  );
};

export default Home;
