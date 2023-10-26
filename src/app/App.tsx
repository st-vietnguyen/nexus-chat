import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import i18n from './core/services/i18n.service';
import { Footer, Header } from '@shared/components/layout/index';
import '@stylesheet/styles.scss';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
    <BrowserRouter>
      <Header />
      <p>Page content</p>
      <Footer />
    </BrowserRouter>
    </I18nextProvider>
  </React.StrictMode>,
);
