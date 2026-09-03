import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { DriverListView } from 'src/sections/driver/views';
// ----------------------------------------------------------------------

const metadata = { title: `Driver list | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <DriverListView />
    </>
  );
}
