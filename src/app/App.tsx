import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import i18n from './core/services/i18n.service';
import { Footer, Header } from '@shared/components/layout/index';
import { RouterOutlet } from '@core/modules/custom-router-dom';
import '@stylesheet/styles.scss';

import appRoutes from './app.routes';
import AppSuspense from './AppSuspense';
import { AuthProvider } from './shared/contexts/authContext';

const root = createRoot(document.getElementById('root'));
root.render(
  <I18nextProvider i18n={i18n}>
    <AuthProvider>
      <BrowserRouter>
        <AppSuspense fallback={<></>}>
          <Header />
        </AppSuspense>
        <AppSuspense fallback={<></>}>
          <RouterOutlet routes={appRoutes} />
        </AppSuspense>
        <AppSuspense fallback={<></>}>
          <Footer />
        </AppSuspense>
      </BrowserRouter>
    </AuthProvider>
  </I18nextProvider>
);
