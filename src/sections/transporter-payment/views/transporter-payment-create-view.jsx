import { useSearchParams } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import TransporterPaymentSimpleForm from '../transporter-payment-simple-form';

export function TransporterPaymentCreateView() {
  const [searchParams] = useSearchParams();
  const transporterId = searchParams.get('transporterId');
  const transportName = searchParams.get('transportName');
  const address = searchParams.get('address');
  const cellNo = searchParams.get('cellNo');
  const podCharges = searchParams.get('podCharges');

  const currentTransporter = transporterId
    ? {
        _id: transporterId,
        transportName: transportName || '',
        address: address || '',
        cellNo: cellNo || '',
        podCharges: podCharges ? Number(podCharges) : 0,
      }
    : null;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create Transporter Payment"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Transporter Payment', href: paths.dashboard.transporterPayment.root },
          { name: 'Create' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <TransporterPaymentSimpleForm currentTransporter={currentTransporter} />
    </DashboardContent>
  );
}
