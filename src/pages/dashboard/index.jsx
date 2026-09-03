import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import {
  useDashboardCounts,
  useSubtripStatusSummary,
  useInvoiceStatusSummary,
  useVehicleDocumentsSummary,
} from 'src/query/use-dashboard';

import { OverviewAppView } from 'src/sections/overview/app/view';

// ----------------------------------------------------------------------

const metadata = { title: `Dashboard - ${CONFIG.site.name}` };

export default function OverviewAppPage() {
  const { data: counts, isLoading: countsLoading, isError: countsError } = useDashboardCounts();

  const {
    data: subtripStatusSummary,
    isLoading: statusSummaryLoading,
    isError: statusSummaryError,
  } = useSubtripStatusSummary();

  const {
    data: invoiceStatusSummary,
    isLoading: invoiceStatusLoading,
    isError: invoiceStatusError,
  } = useInvoiceStatusSummary();

  // Vehicle documents summary (default 30 days)
  const {
    data: vehicleDocsSummary,
    isLoading: vehicleDocsLoading,
    isError: vehicleDocsError,
  } = useVehicleDocumentsSummary(30);

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>
      <OverviewAppView
        counts={counts || {}}
        subtripStatusSummary={subtripStatusSummary || {}}
        invoiceStatusSummary={invoiceStatusSummary || {}}
        vehicleDocsSummary={vehicleDocsSummary || {}}
        loading={{
          counts: countsLoading,
          statusSummary: statusSummaryLoading,
          invoiceStatus: invoiceStatusLoading,
          vehicleDocs: vehicleDocsLoading,
        }}
        error={{
          counts: countsError,
          statusSummary: statusSummaryError,
          invoiceStatus: invoiceStatusError,
          vehicleDocs: vehicleDocsError,
        }}
      />
    </>
  );
}
