import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { useTrip } from 'src/query/use-trip';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';

import { TripDetailView } from 'src/sections/trip/views';

// ----------------------------------------------------------------------

const metadata = { title: `Trip details | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id } = useParams();

  const { data: trip, isLoading, isError } = useTrip(id);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError) {
    return (
      <EmptyContent
        filled
        title="Something went wrong!"
        sx={{ py: 10, height: 'auto', flexGrow: 'unset' }}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <TripDetailView trip={trip} />
    </>
  );
}
