import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { MainLayout } from 'src/layouts/main';
import { SimpleLayout } from 'src/layouts/simple';

import { SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

const FaqsPage = lazy(() => import('src/pages/faqs'));
const AboutPage = lazy(() => import('src/pages/about-us'));
const ContactPage = lazy(() => import('src/pages/contact-us'));
const PricingPage = lazy(() => import('src/pages/pricing'));
const PaymentPage = lazy(() => import('src/pages/payment'));
const ComingSoonPage = lazy(() => import('src/pages/coming-soon'));
const MaintenancePage = lazy(() => import('src/pages/maintenance'));
// Tools
const LRGeneratorPage = lazy(() => import('src/pages/tools/lr-generator'));
// Public detail pages
const PublicSubtripDetailsPage = lazy(() => import('src/pages/public/subtrip/details'));
const PublicEpodPage = lazy(() => import('src/pages/public/subtrip/epod'));
const PublicTransporterPaymentDetailsPage = lazy(
  () => import('src/pages/public/transporter-payment/details')
);

// Error
const Page500 = lazy(() => import('src/pages/error/500'));
const Page403 = lazy(() => import('src/pages/error/403'));
const Page404 = lazy(() => import('src/pages/error/404'));
// Blank
const BlankPage = lazy(() => import('src/pages/blank'));

// ----------------------------------------------------------------------

export const mainRoutes = [
  {
    element: (
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    ),
    children: [
      {
        element: (
          <MainLayout>
            <Outlet />
          </MainLayout>
        ),
        children: [
          {
            path: 'about-us',
            element: <AboutPage />,
          },
          {
            path: 'contact-us',
            element: <ContactPage />,
          },
          {
            path: 'faqs',
            element: <FaqsPage />,
          },
          {
            path: 'blank',
            element: <BlankPage />,
          },
          {
            path: 'tools/lr-generator',
            element: <LRGeneratorPage />,
          },
        ],
      },
      {
        path: 'public',
        element: <Outlet />,
        children: [
          { path: 'subtrip/:id', element: <PublicSubtripDetailsPage /> },
          { path: 'subtrip/epod/:id', element: <PublicEpodPage /> },
          { path: 'transporter-payment/:id', element: <PublicTransporterPaymentDetailsPage /> },
        ],
      },
      {
        path: 'pricing',
        element: (
          <SimpleLayout>
            <PricingPage />
          </SimpleLayout>
        ),
      },
      {
        path: 'payment',
        element: (
          <SimpleLayout>
            <PaymentPage />
          </SimpleLayout>
        ),
      },
      {
        path: 'coming-soon',
        element: (
          <SimpleLayout>
            <ComingSoonPage />
          </SimpleLayout>
        ),
      },
      {
        path: 'maintenance',
        element: (
          <SimpleLayout>
            <MaintenancePage />
          </SimpleLayout>
        ),
      },
      { path: '500', element: <Page500 /> },
      { path: '404', element: <Page404 /> },
      { path: '403', element: <Page403 /> },
    ],
  },
];
