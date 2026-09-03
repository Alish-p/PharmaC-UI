import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { useInvoice } from 'src/query/use-invoice';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';

import { InvoiceDetailView } from 'src/sections/invoice/views';

// ----------------------------------------------------------------------

const metadata = { title: `Invoice details | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id } = useParams();
  const { data: invoice, isLoading, isError } = useInvoice(id);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError) {
    return <EmptyContent />;
  }

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <InvoiceDetailView invoice={invoice} loading={isLoading} />
    </>
  );
}
