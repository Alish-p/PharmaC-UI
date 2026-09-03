import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { TransporterPaymentEditView } from 'src/sections/transporter-payment/views';

// ----------------------------------------------------------------------

const metadata = { title: `Transporter Payment Edit | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <TransporterPaymentEditView />
    </>
  );
}
