import React from 'react';
import { useTranslation } from 'react-i18next';

const Home = (): JSX.Element => {
  const { t } = useTranslation('common');
  return (
    <div>{t('pages.homepage')}({process.env.APP_ENV})</div>
  );
};

export default Home;
