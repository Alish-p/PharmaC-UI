import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { PurchaseOrderListView } from 'src/sections/purchase-order/views';

const metadata = { title: `Purchase Orders | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <PurchaseOrderListView />
    </>
  );
}
