import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { useTrip } from 'src/query/use-trip';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';

import { TripEditView } from 'src/sections/trip/views';

// ----------------------------------------------------------------------

const metadata = { title: `Trip edit | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id = '' } = useParams();

  const { data: trip, isLoading: tripLoading, isError: tripError } = useTrip(id);
  if (tripLoading) {
    return <LoadingScreen />;
  }

  if (tripError) {
    return <EmptyContent />;
  }

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <TripEditView trip={trip} />
    </>
  );
}
