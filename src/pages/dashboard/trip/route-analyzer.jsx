import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { RouteAnalyzerView } from 'src/sections/trip/views';

// ----------------------------------------------------------------------

const metadata = { title: `Route Analyzer | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <RouteAnalyzerView />
    </>
  );
}
