import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { WorkOrderListView } from 'src/sections/work-order/views';

const metadata = { title: `Work Orders | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <WorkOrderListView />
    </>
  );
}
