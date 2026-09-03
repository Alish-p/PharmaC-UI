import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { useCustomer } from 'src/query/use-customer';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';

import { CustomerEditView } from 'src/sections/customer/views';

// ----------------------------------------------------------------------

const metadata = { title: `Customer edit | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id = '' } = useParams();

  const { data: customer, isLoading: customerLoading, isError: customerError } = useCustomer(id);

  if (customerLoading) {
    return <LoadingScreen />;
  }

  if (customerError) {
    return <EmptyContent />;
  }

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <CustomerEditView customer={customer} />
    </>
  );
}
