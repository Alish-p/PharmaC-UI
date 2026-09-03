import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { WorkOrderCreateView } from 'src/sections/work-order/views';

const metadata = { title: `Create Work Order | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <WorkOrderCreateView />
    </>
  );
}
