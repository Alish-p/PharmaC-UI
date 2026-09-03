import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { useVendor } from 'src/query/use-vendor';
import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import PurchaseOrderForm from '../purchase-order-form';

export function PurchaseOrderCreateView() {
  const [searchParams] = useSearchParams();
  const vendorId = searchParams.get('vendor');

  // Fetch vendor details when only an ID is provided via URL
  const { data: vendorData } = useVendor(vendorId);

  const currentPurchaseOrder = useMemo(() => {
    if (!vendorId) return undefined;

    // Use fetched vendor data if available, otherwise use the ID only
    if (vendorData) {
      return {
        vendor: {
          _id: vendorData._id,
          name: vendorData.name || '',
          address: vendorData.address || '',
          phone: vendorData.phone || '',
        },
      };
    }

    // Return with just the ID while loading — form will show once vendorData arrives
    return { vendor: { _id: vendorId, name: '', address: '', phone: '' } };
  }, [vendorId, vendorData]);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create Purchase Order"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Purchase Orders', href: paths.dashboard.purchaseOrder.list },
          { name: 'New Purchase Order' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PurchaseOrderForm currentPurchaseOrder={currentPurchaseOrder} />
    </DashboardContent>
  );
}
