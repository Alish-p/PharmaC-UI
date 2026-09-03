import { Helmet } from 'react-helmet-async';

import { useSearchParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { SubtripReceiveView } from 'src/sections/subtrip/views';

// ----------------------------------------------------------------------

const metadata = { title: `Receive Job | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const searchParams = useSearchParams();
  const currentSubtrip = searchParams.get('currentSubtrip');

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>
      <SubtripReceiveView currentSubtrip={currentSubtrip} />
    </>
  );
}
