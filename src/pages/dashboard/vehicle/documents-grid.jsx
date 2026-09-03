import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { VehicleDocumentGridView } from 'src/sections/vehicle/documents/components/vehicle-document-grid-view';

const metadata = { title: `Documents Grid | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>
      <VehicleDocumentGridView />
    </>
  );
}
