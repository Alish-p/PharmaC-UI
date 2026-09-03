import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { TripListView } from 'src/sections/trip/views';

// ----------------------------------------------------------------------

const metadata = { title: `Trip list | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <TripListView />
    </>
  );
}
