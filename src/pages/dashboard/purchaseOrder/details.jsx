import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { usePurchaseOrder } from 'src/query/use-purchase-order';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';

import { PurchaseOrderDetailView } from 'src/sections/purchase-order/views';

const metadata = { title: `Purchase Order details | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id = '' } = useParams();

  const { data: purchaseOrder, isLoading, isError } = usePurchaseOrder(id);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError || !purchaseOrder) {
    return (
      <EmptyContent
        filled
        title="Something went wrong!"
        sx={{ py: 10, height: 'auto', flexGrow: 'unset' }}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <PurchaseOrderDetailView purchaseOrder={purchaseOrder} />
    </>
  );
}
