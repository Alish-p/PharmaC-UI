import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { TransporterCreateView } from 'src/sections/transporter/views';

// ----------------------------------------------------------------------

const metadata = { title: `Create a new Transporter | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <TransporterCreateView />
    </>
  );
}
