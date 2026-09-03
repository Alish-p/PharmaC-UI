import { Helmet } from 'react-helmet-async';

import { useSearchParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { TransporterAdvanceCreateView } from 'src/sections/expense/views/transporter-advance-create-view';

// ----------------------------------------------------------------------

const metadata = { title: `Create a new Advance | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const searchParams = useSearchParams();

  const currentSubtrip = searchParams.get('currentSubtrip');

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <TransporterAdvanceCreateView currentSubtrip={currentSubtrip} />
    </>
  );
}
