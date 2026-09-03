import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { CustomerCreateView } from 'src/sections/customer/views';

// -------------------------------------------------------------

const metadata = { title: `Create a new Customer | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <CustomerCreateView />
    </>
  );
}
