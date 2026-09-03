import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { usePurchaseOrder } from 'src/query/use-purchase-order';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import PurchaseOrderForm from '../purchase-order-form';

export function PurchaseOrderEditView() {
  const { id = '' } = useParams();

  const { data: purchaseOrder, isLoading, isError } = usePurchaseOrder(id);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError || !purchaseOrder) {
    return (
      <DashboardContent>
        <EmptyContent
          filled
          title="Purchase order not found!"
          sx={{ py: 10, height: 'auto', flexGrow: 'unset' }}
        />
      </DashboardContent>
    );
  }

  const isEditable = purchaseOrder.status === 'pending-approval';

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit Purchase Order"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Purchase Orders', href: paths.dashboard.purchaseOrder.list },
          { name: purchaseOrder.purchaseOrderNo || 'Edit Purchase Order' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        {isEditable ? (
          <PurchaseOrderForm currentPurchaseOrder={purchaseOrder} />
        ) : (
          <Alert severity="warning" variant="outlined">
            <Stack spacing={2}>
              <Typography variant="subtitle1">Purchase Order Editing Not Available</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                For data integrity reasons, purchase orders cannot be edited once they have been
                approved or processed. This purchase order is currently in &apos;
                {purchaseOrder.status}&apos; status. Only purchase orders in &apos;Pending
                Approval&apos; status can be edited.
              </Typography>
            </Stack>
          </Alert>
        )}
      </Stack>
    </DashboardContent>
  );
}
