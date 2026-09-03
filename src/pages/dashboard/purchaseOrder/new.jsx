import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { PurchaseOrderCreateView } from 'src/sections/purchase-order/views';

const metadata = { title: `Create Purchase Order | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <PurchaseOrderCreateView />
    </>
  );
}
