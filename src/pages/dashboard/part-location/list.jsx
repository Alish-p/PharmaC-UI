import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { PartLocationListView } from 'src/sections/part-location/views';

const metadata = { title: `Part Locations list | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <PartLocationListView />
    </>
  );
}
