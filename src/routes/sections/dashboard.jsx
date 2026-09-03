import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { CONFIG } from 'src/config-global';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

// PharmaC Pages
const OverviewPage = lazy(() => import('src/pages/dashboard/overview'));
const MedicinesListPage = lazy(() => import('src/pages/dashboard/medicine/list'));
const BatchesListPage = lazy(() => import('src/pages/dashboard/batch/list'));
const PosBillingPage = lazy(() => import('src/pages/dashboard/pos/index'));
const PrescriptionPage = lazy(() => import('src/pages/dashboard/prescription/index'));
const SuppliersListPage = lazy(() => import('src/pages/dashboard/supplier/list'));
const CustomersListPage = lazy(() => import('src/pages/dashboard/customer/list'));
const StaffListPage = lazy(() => import('src/pages/dashboard/user/list'));
const PharmacySettingsPage = lazy(() => import('src/pages/dashboard/settings/index'));

const BlankPage = lazy(() => import('src/pages/dashboard/blank'));

// ----------------------------------------------------------------------

const layoutContent = (
  <DashboardLayout>
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  </DashboardLayout>
);

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? <>{layoutContent}</> : <AuthGuard>{layoutContent}</AuthGuard>,
    children: [
      { element: <OverviewPage />, index: true },
      { path: 'overview', element: <OverviewPage /> },
      { path: 'medicine', element: <MedicinesListPage /> },
      { path: 'batch', element: <BatchesListPage /> },
      { path: 'pos', element: <PosBillingPage /> },
      { path: 'prescription', element: <PrescriptionPage /> },
      { path: 'supplier', element: <SuppliersListPage /> },
      { path: 'customer', element: <CustomersListPage /> },
      { path: 'user', element: <StaffListPage /> },
      { path: 'settings', element: <PharmacySettingsPage /> },
      { path: 'blank', element: <BlankPage /> },
    ],
  },
];
