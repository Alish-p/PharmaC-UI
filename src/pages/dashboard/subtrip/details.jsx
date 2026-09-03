import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { useSubtrip } from 'src/query/use-subtrip';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';

import { SubtripDetailView } from 'src/sections/subtrip/views';

// ----------------------------------------------------------------------

const metadata = { title: `Job details | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id } = useParams();

  const { data: subtrip, isLoading, isError } = useSubtrip(id);

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

      <SubtripDetailView subtrip={subtrip} />
    </>
  );
}
