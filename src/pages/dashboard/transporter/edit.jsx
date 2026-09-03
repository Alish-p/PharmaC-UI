import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { useTransporter } from 'src/query/use-transporter';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';

import { TransporterEditView } from 'src/sections/transporter/views';

// ----------------------------------------------------------------------

const metadata = { title: `Transporter edit | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id = '' } = useParams();

  const {
    data: transporter,
    isLoading: transporterLoading,
    isError: transporterError,
  } = useTransporter(id);

  if (transporterLoading) {
    return <LoadingScreen />;
  }

  if (transporterError) {
    return <EmptyContent />;
  }

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <TransporterEditView transporter={transporter} />
    </>
  );
}
