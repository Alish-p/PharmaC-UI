import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { PartLocationCreateView } from 'src/sections/part-location/views';

const metadata = {
  title: `Create a new Part Location | Dashboard - ${CONFIG.site.name}`,
};

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <PartLocationCreateView />
    </>
  );
}
