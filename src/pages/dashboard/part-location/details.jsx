import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { usePartLocation } from 'src/query/use-part-location';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';

import { PartLocationDetailView } from 'src/sections/part-location/views';

const metadata = { title: `Part Location details | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id = '' } = useParams();

  const { data: partLocation, isLoading, isError } = usePartLocation(id);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError || !partLocation) {
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

      <PartLocationDetailView partLocation={partLocation} />
    </>
  );
}
