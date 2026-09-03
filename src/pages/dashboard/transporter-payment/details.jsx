import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { useTransporterPayment } from 'src/query/use-transporter-payment';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';

import { TransporterPaymentDetailView } from 'src/sections/transporter-payment/views';

// ----------------------------------------------------------------------

const metadata = { title: `Transporter Payment details | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id } = useParams();

  const { data: transporterPayment, isLoading, isError } = useTransporterPayment(id);

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

      <TransporterPaymentDetailView transporterPayment={transporterPayment} />
    </>
  );
}
