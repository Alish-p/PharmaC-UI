import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { TransporterPaymentCreateView } from 'src/sections/transporter-payment/views';

// ----------------------------------------------------------------------

const metadata = { title: `Create a new Transporter Payment | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <TransporterPaymentCreateView />
    </>
  );
}
