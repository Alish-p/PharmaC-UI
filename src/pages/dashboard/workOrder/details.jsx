import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { useWorkOrder } from 'src/query/use-work-order';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';

import { WorkOrderDetailView } from 'src/sections/work-order/views';

const metadata = { title: `Work Order details | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id = '' } = useParams();

  const { data: workOrder, isLoading, isError } = useWorkOrder(id);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError || !workOrder) {
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

      <WorkOrderDetailView workOrder={workOrder} />
    </>
  );
}
