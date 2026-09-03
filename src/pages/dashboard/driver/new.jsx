import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { DriverCreateView } from 'src/sections/driver/views';

// ----------------------------------------------------------------------

const metadata = { title: `Create a new Driver | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <DriverCreateView />
    </>
  );
}
