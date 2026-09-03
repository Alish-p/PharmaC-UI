import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { VehicleCreateView } from 'src/sections/vehicle/views';

// ----------------------------------------------------------------------

const metadata = { title: `Create a new invoice | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <VehicleCreateView />
    </>
  );
}
