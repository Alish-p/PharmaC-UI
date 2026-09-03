import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { useCustomer } from 'src/query/use-customer';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';

import { CustomerDetailView } from 'src/sections/customer/views';

// ----------------------------------------------------------------------

const metadata = { title: `Customer details | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id = '' } = useParams();

  const { data: customer, isLoading, isError } = useCustomer(id);

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

      <CustomerDetailView customer={customer} />
    </>
  );
}
