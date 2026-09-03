import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { SubtripListView } from 'src/sections/subtrip/views';
// ----------------------------------------------------------------------

const metadata = { title: `Job list | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <SubtripListView />
    </>
  );
}
