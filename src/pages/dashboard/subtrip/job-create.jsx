import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { SubtripJobCreateView } from 'src/sections/subtrip/views';

const metadata = { title: `Create a new Job | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <SubtripJobCreateView />
    </>
  );
}
