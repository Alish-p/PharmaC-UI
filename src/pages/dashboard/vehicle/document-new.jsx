import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { VehicleDocumentCreateView } from 'src/sections/vehicle/documents/views';

// ----------------------------------------------------------------------

const metadata = { title: `Create Vehicle Document | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <VehicleDocumentCreateView />
    </>
  );
}
