import { lazy, Suspense } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Unstable_Grid2';

import { useSystemFeatures } from 'src/hooks/use-system-features';

import { _appFeatured } from 'src/_mock';
import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { VEHICLE_MODES } from 'src/constants/vehicle-mode';
import { SeoIllustration } from 'src/assets/illustrations';

import { SvgColor } from 'src/components/svg-color';

import { useAuthContext } from 'src/auth/hooks';

import { AppWelcome } from '../app-welcome';
import { AppFeatured } from '../app-featured';
import { DashboardTotalWidget } from '../app-total-widget';
import { AppMonthlySummaryTabs } from '../monthly-summary';
import { LoadingTargetWidget } from '../loading-target-widget';
import { AppTyreSummaryWidget } from '../app-tyre-summary-widget';
import { AppDailySummaryWidget } from '../app-daily-summary-widget';
import { AppSubtripExpensesCategory } from '../app-subtrip-expenses';
import { AppInvoiceAmountSummary } from '../app-invoice-amount-summary';
import { AppMaterialWeightSummary } from '../app-material-weight-summary';
import { AppInventorySummaryWidget } from '../app-inventory-summary-widget';
import { AppWorkOrderSummaryWidget } from '../app-work-order-summary-widget';
import { AppTransporterPaymentSummary } from '../app-transporter-payment-summary';

// Lazy load heavy chart and map widgets
const EwaybillByStateWidget = lazy(() =>
  import('src/sections/ewaybill/ewaybill-by-state-widget').then((m) => ({
    default: m.EwaybillByStateWidget,
  }))
);
const FinancialMonthlyChart = lazy(() =>
  import('../app-finance-charts').then((m) => ({ default: m.FinancialMonthlyChart }))
);
const InvoicePiechartWidget = lazy(() =>
  import('../app-invoice-pie-chart').then((m) => ({ default: m.InvoicePiechartWidget }))
);
const SubtripExpiryTable = lazy(() =>
  import('../app-subtrip-expiry-table').then((m) => ({ default: m.SubtripExpiryTable }))
);
const VehicleDocumentsPieChart = lazy(() =>
  import('../app-vehicle-documents-pie-chart').then((m) => ({
    default: m.VehicleDocumentsPieChart,
  }))
);
const AppVehicleDocumentsExpiryTable = lazy(() =>
  import('../app-vehicle-documents-expiry-table').then((m) => ({
    default: m.AppVehicleDocumentsExpiryTable,
  }))
);
const DashboardSubtripCompletedWidget = lazy(() =>
  import('../dashboard-subtrip-completed-widget').then((m) => ({
    default: m.DashboardSubtripCompletedWidget,
  }))
);

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  vehicle: icon('ic_vehicle'),
  driver: icon('ic-user'),
  customer: icon('ic_customer'),
  transporter: icon('ic_transporter'),
  subtrip: icon('ic_subtrip'),
  invoice: icon('ic-invoice'),
};

function WidgetSkeleton({ height = 280 }) {
  return <Skeleton variant="rounded" width="100%" height={height} />;
}

function TotalWidgetSkeleton() {
  return (
    <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 2 }}>
      <Skeleton variant="circular" width={48} height={48} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="40%" />
    </Box>
  );
}

export function OverviewAppView({
  counts = {},
  invoiceStatusSummary = {},
  vehicleDocsSummary = {},
  loading = {},
}) {
  const { user, tenant } = useAuthContext();
  const { vehicleMode } = useSystemFeatures();
  const managesMarketVehicles = vehicleMode !== VEHICLE_MODES.OWN_ONLY;

  const {
    invoices = 0,
    vehicles = 0,
    transporters = 0,
    customers = 0,
    drivers = 0,
    subtrips = 0,
  } = counts;

  const tyreEnabled = tenant?.integrations?.tyre?.enabled;
  const inventoryEnabled = tenant?.integrations?.maintenanceAndInventory?.enabled;

  return (
    <DashboardContent>
      <Grid container spacing={3}>
        <Grid xs={12} md={7}>
          <AppWelcome
            title={`Welcome back 👋 \n ${user?.name || 'User'} `}
            description="Begin leveraging the Tranzit portal to streamline and manage your logistics operations seamlessly."
            img={<SeoIllustration hideBackground />}
            action={
              <Button variant="contained" color="primary">
                Explore
              </Button>
            }
          />
        </Grid>

        <Grid xs={12} md={5}>
          <AppFeatured list={_appFeatured} />
        </Grid>

        {/* Total's section */}
        <>
          <Grid xs={6} sm={4} md={2}>
            {loading.counts ? (
              <TotalWidgetSkeleton />
            ) : (
              <DashboardTotalWidget
                title="Total Vehicles"
                total={vehicles}
                color="warning"
                icon={ICONS.vehicle}
              />
            )}
          </Grid>

          <Grid xs={6} sm={4} md={2}>
            {loading.counts ? (
              <TotalWidgetSkeleton />
            ) : (
              <DashboardTotalWidget
                title="Total Drivers"
                total={drivers}
                color="primary"
                icon={ICONS.driver}
              />
            )}
          </Grid>

          <Grid xs={6} sm={4} md={2}>
            {loading.counts ? (
              <TotalWidgetSkeleton />
            ) : (
              <DashboardTotalWidget
                title="Total Customers"
                total={customers}
                color="secondary"
                icon={ICONS.customer}
              />
            )}
          </Grid>

          {managesMarketVehicles && (
            <Grid xs={6} sm={4} md={2}>
              {loading.counts ? (
                <TotalWidgetSkeleton />
              ) : (
                <DashboardTotalWidget
                  title="Total Transporters"
                  total={transporters}
                  color="info"
                  icon={ICONS.transporter}
                />
              )}
            </Grid>
          )}

          <Grid xs={6} sm={4} md={2}>
            {loading.counts ? (
              <TotalWidgetSkeleton />
            ) : (
              <DashboardTotalWidget
                title="Total Invoice Generated"
                total={invoices}
                color="error"
                icon={ICONS.invoice}
              />
            )}
          </Grid>

          <Grid xs={6} sm={4} md={2}>
            {loading.counts ? (
              <TotalWidgetSkeleton />
            ) : (
              <DashboardTotalWidget
                title="Total Jobs Completed"
                total={subtrips}
                color="success"
                icon={ICONS.subtrip}
              />
            )}
          </Grid>
        </>

        <Grid xs={12} sm={6}>
          <AppInvoiceAmountSummary />
        </Grid>

        {managesMarketVehicles && (
          <Grid xs={12} sm={6}>
            <AppTransporterPaymentSummary />
          </Grid>
        )}

        {(loading.counts || invoices > 0) && (
          <Grid xs={12} md={6} lg={4}>
            {loading.invoiceStatus ? (
              <WidgetSkeleton height={420} />
            ) : (
              <Suspense fallback={<WidgetSkeleton height={420} />}>
                <InvoicePiechartWidget
                  title="Invoices"
                  subheader="Invoice generated through the dashboard"
                  chart={{
                    series: invoiceStatusSummary?.series || [],
                  }}
                />
              </Suspense>
            )}
          </Grid>
        )}

        <Grid xs={12} md={6} lg={8}>
          <Suspense fallback={<WidgetSkeleton height={420} />}>
            <DashboardSubtripCompletedWidget />
          </Suspense>
        </Grid>

        <Grid xs={12}>
          <AppDailySummaryWidget />
        </Grid>

        <Grid xs={12} md={12}>
          <AppMonthlySummaryTabs />
        </Grid>

        <Grid xs={12} lg={8} sx={{ display: 'flex' }}>
          <Suspense fallback={<WidgetSkeleton height={420} />}>
            <SubtripExpiryTable
              title="⚠️ Expiring Eway Bills"
              subheader="Active jobs with Eway Bills expiring within the next 24 hours. Please take timely action."
              sx={{ height: 420, display: 'flex', flexDirection: 'column', width: 1 }}
            />
          </Suspense>
        </Grid>

        <Grid xs={12} lg={4} sx={{ display: 'flex' }}>
          <Suspense fallback={<WidgetSkeleton height={420} />}>
            <FinancialMonthlyChart
              title="Financial overview"
              sx={{ height: 420, display: 'flex', flexDirection: 'column', width: 1 }}
            />
          </Suspense>
        </Grid>

        <Grid xs={12} lg={8} sx={{ display: 'flex' }}>
          <Suspense fallback={<WidgetSkeleton height={420} />}>
            <AppVehicleDocumentsExpiryTable
              title="Critical: Expired/Expiring Documents"
              subheader="Vehicle documents that need immediate attention to maintain compliance."
              sx={{ height: 420, display: 'flex', flexDirection: 'column', width: 1 }}
            />
          </Suspense>
        </Grid>

        {(loading.vehicleDocs || vehicleDocsSummary) && (
          <Grid xs={12} md={6} lg={4} sx={{ display: 'flex' }}>
            {loading.vehicleDocs ? (
              <WidgetSkeleton height={420} />
            ) : (
              <Suspense fallback={<WidgetSkeleton height={420} />}>
                <VehicleDocumentsPieChart
                  title="Vehicle Documents"
                  subheader="Status of vehicle documents in the fleet"
                  chart={{
                    series: [
                      { label: 'Missing', value: vehicleDocsSummary?.missing ?? 0 },
                      { label: 'Expired', value: vehicleDocsSummary?.expired ?? 0 },
                      { label: 'Expiring', value: vehicleDocsSummary?.expiring ?? 0 },
                      { label: 'Valid', value: vehicleDocsSummary?.valid ?? 0 },
                    ],
                  }}
                  sx={{ height: 420, display: 'flex', flexDirection: 'column', width: 1 }}
                />
              </Suspense>
            )}
          </Grid>
        )}

        {/* Tyre Module Widget — only shown when tyre integration is enabled */}
        {tyreEnabled && (
          <Grid xs={12} md={6} lg={4}>
            <AppTyreSummaryWidget />
          </Grid>
        )}

        {/* Inventory & Maintenance Widget — only shown when M&I integration is enabled */}
        {inventoryEnabled && (
          <>
            <Grid xs={12} md={6} lg={4}>
              <AppInventorySummaryWidget />
            </Grid>
            <Grid xs={12} md={6} lg={4}>
              <AppWorkOrderSummaryWidget />
            </Grid>
          </>
        )}

        <Grid xs={12} lg={6}>
          <AppMaterialWeightSummary title="Material summary" />
        </Grid>

        <Grid xs={12} lg={6}>
          <AppSubtripExpensesCategory title="Expenses categories" />
        </Grid>



        {tenant?.integrations?.ewayBill?.enabled && (
          <Grid xs={12}>
            <Suspense fallback={<WidgetSkeleton height={600} />}>
              <EwaybillByStateWidget />
            </Suspense>
          </Grid>
        )}

        <Grid xs={12} lg={12}>
          <LoadingTargetWidget />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
