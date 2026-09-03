import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { usePart } from 'src/query/use-part';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';

import { PartEditView } from 'src/sections/part/views';

const metadata = { title: `Edit Part | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id = '' } = useParams();

  const { data: part, isLoading, isError } = usePart(id);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError || !part) {
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

      <PartEditView part={part} />
    </>
  );
}
