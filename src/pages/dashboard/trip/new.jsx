import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

// import { TripCreateView } from 'src/sections/trip/views';

// ----------------------------------------------------------------------

const metadata = { title: `Create a new Trip | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      {/* <TripCreateView /> */}
    </>
  );
}
