import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { useSubtrip } from 'src/query/use-subtrip';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';

import { SubtripEditView } from 'src/sections/subtrip/views';

// ----------------------------------------------------------------------

const metadata = { title: `Job edit | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id = '' } = useParams();

  const { data: subtrip, isLoading: subtripLoading, isError: subtripError } = useSubtrip(id);

  if (subtripLoading) {
    return <LoadingScreen />;
  }

  if (subtripError) {
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

      <SubtripEditView subtrip={subtrip} />
    </>
  );
}
