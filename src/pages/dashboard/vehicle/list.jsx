import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { VehicleListView } from 'src/sections/vehicle/views';

// ----------------------------------------------------------------------

const metadata = { title: `Vehicle list | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <VehicleListView />
    </>
  );
}
