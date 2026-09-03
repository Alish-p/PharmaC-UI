import { lazy, Suspense } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

import { CONFIG } from 'src/config-global';
import { SimpleLayout } from 'src/layouts/simple';

import { SplashScreen } from 'src/components/loading-screen';

import { authRoutes } from './auth';
import { mainRoutes } from './main';
import { authDemoRoutes } from './auth-demo';
import { dashboardRoutes } from './dashboard';

// ----------------------------------------------------------------------

const MaintenancePage = lazy(() => import('src/pages/maintenance'));

export function Router() {
  const routes = CONFIG.maintenanceMode
    ? [
        {
          path: '*',
          element: (
            <Suspense fallback={<SplashScreen />}>
              <SimpleLayout>
                <MaintenancePage />
              </SimpleLayout>
            </Suspense>
          ),
        },
      ]
    : [
        {
          path: '/',
          element: <Navigate to={CONFIG.auth.redirectPath} replace />,
        },

        // Auth
        ...authRoutes,
        ...authDemoRoutes,

        // Dashboard
        ...dashboardRoutes,

        // Main
        ...mainRoutes,

        // No match
        { path: '*', element: <Navigate to="/404" replace /> },
      ];

  return useRoutes(routes);
}
