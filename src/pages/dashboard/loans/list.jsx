import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { LoansListView } from 'src/sections/loans/views';

// ----------------------------------------------------------------------

const metadata = { title: `Loans list | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <LoansListView />
    </>
  );
}
