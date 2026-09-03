import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { PartCreateView } from 'src/sections/part/views';

const metadata = { title: `Create a new Part | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <PartCreateView />
    </>
  );
}
