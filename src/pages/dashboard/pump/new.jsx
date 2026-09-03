import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { PumpCreateView } from 'src/sections/pump/views';

// ----------------------------------------------------------------------

const metadata = { title: `Create a new Pump | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <PumpCreateView />
    </>
  );
}
