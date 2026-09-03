import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { VendorCreateView } from 'src/sections/vendor/views';

const metadata = { title: `Create a new Vendor | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <VendorCreateView />
    </>
  );
}
