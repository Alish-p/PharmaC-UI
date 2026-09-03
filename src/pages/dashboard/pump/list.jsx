import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { PumpListView } from 'src/sections/pump/views';
// ----------------------------------------------------------------------

const metadata = { title: `Pump list | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <PumpListView />
    </>
  );
}
