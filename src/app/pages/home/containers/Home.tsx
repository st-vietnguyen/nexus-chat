import React from 'react';
import { useTranslation } from 'react-i18next';
import Logo from '../../../../assets/react.svg?react';

const Home = (): JSX.Element => {
  const { t } = useTranslation('common');
  return (
    <>
      <div>{t('pages.homepage')}({process.env.APP_ENV})</div>
      <div>
        <Logo />
      </div>
    </>
  );
};

export default Home;
