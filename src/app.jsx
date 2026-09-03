/* eslint-disable import/no-unresolved */
import 'src/global.css';
import 'leaflet/dist/leaflet.css';

// ----------------------------------------------------------------------

import { Router } from 'src/routes/sections';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import { LocalizationProvider } from 'src/locales';
import { I18nProvider } from 'src/locales/i18n-provider';
import { ThemeProvider } from 'src/theme/theme-provider';
import { ReactQueryProvider } from 'src/query/query-provider';

import { Snackbar } from 'src/components/snackbar';
import { ProgressBar } from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { SettingsDrawer, defaultSettings, SettingsProvider } from 'src/components/settings';

import { TenantProvider } from 'src/auth/tenant';
import { AuthProvider } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

export default function App() {
  useScrollToTop();

  return (
    <I18nProvider>
      <LocalizationProvider>
        <AuthProvider>
          <TenantProvider>
            <ReactQueryProvider>
              <SettingsProvider settings={defaultSettings}>
                <ThemeProvider>
                  <MotionLazy>
                    <Snackbar />
                    <ProgressBar />
                    <SettingsDrawer />
                    <Router />
                  </MotionLazy>
                </ThemeProvider>
              </SettingsProvider>
            </ReactQueryProvider>
          </TenantProvider>
        </AuthProvider>
      </LocalizationProvider>
    </I18nProvider>
  );
}
