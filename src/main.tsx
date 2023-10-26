import React from 'react';
import { I18nextProvider } from 'react-i18next';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import i18n from './app/core/services/i18n.service';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </React.StrictMode>,
);
