import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { VendorListView } from 'src/sections/vendor/views';

const metadata = { title: `Vendors list | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <VendorListView />
    </>
  );
}
