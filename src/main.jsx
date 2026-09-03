import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { Font } from '@react-pdf/renderer';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import App from './app';
import { CONFIG } from './config-global';

// ----------------------------------------------------------------------

try {
  Font.register({
    family: 'Roboto',
    fonts: [
      { src: '/fonts/Roboto-Regular.ttf', fontWeight: 400 },
      { src: '/fonts/Roboto-Bold.ttf', fontWeight: 700 },
    ],
  });
  // eslint-disable-next-line no-console
  console.log('[PDF] Roboto font registered successfully');
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('[PDF] Font registration skipped (already registered):', e?.message);
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <HelmetProvider>
    <BrowserRouter basename={CONFIG.site.basePath}>
      <Suspense>
        <App />
      </Suspense>
    </BrowserRouter>
  </HelmetProvider>
);
