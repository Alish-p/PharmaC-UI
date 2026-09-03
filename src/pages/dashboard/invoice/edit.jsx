import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { InvoiceEditView } from 'src/sections/invoice/views';

// ----------------------------------------------------------------------

const metadata = { title: `Invoice edit | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <InvoiceEditView />
    </>
  );
}
