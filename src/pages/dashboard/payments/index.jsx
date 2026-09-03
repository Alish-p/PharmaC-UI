import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { useTenant } from 'src/query/use-tenant';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';

import { PaymentHistoryView } from 'src/sections/payment-history';

const metadata = { title: `Payments | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { data: tenant, isLoading, isError } = useTenant();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError) {
    return <EmptyContent />;
  }

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <PaymentHistoryView payments={tenant.paymentHistory || []} tenant={tenant} />
    </>
  );
}
