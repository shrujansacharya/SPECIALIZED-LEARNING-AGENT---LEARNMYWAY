import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'; // Import the initialized i18n instance
import ErrorBoundary from './components/ErrorBoundary'; // Import the error boundary
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter
          future={{
            v7_startTransition: true, // Opt into React.startTransition for v7
            v7_relativeSplatPath: true, // Opt into v7 splat path behavior
          }}
        >
          <App />
        </BrowserRouter>
      </I18nextProvider>
    </ErrorBoundary>
  </StrictMode>
);