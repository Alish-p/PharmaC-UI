import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { PurchaseOrderEditView } from 'src/sections/purchase-order/views';

const metadata = { title: `Edit Purchase Order | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <PurchaseOrderEditView />
    </>
  );
}
