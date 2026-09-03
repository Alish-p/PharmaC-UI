import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { usePump } from 'src/query/use-pump';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';

import { PumpEditView } from 'src/sections/pump/views';

// ----------------------------------------------------------------------

const metadata = { title: `Pump edit | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id = '' } = useParams();

  const { data: pump, isLoading: pumpLoading } = usePump(id);

  if (pumpLoading) {
    return <LoadingScreen />;
  }

  if (!pump) {
    return <EmptyContent />;
  }

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <PumpEditView pump={pump} />
    </>
  );
}
