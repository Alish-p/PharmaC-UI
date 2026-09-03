import { useNavigate } from 'react-router';

import Card from '@mui/material/Card';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { useSearchParams } from 'src/routes/hooks';

import { useVehicle } from 'src/query/use-vehicle';
import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import VehicleDocumentForm from '../vehicle-document-form';

export function VehicleDocumentCreateView() {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get('vehicleId') || '';
  const docType = searchParams.get('docType') || '';
  
  const { data: vehicle } = useVehicle(vehicleId, {
    enabled: !!vehicleId,
  });

  const handleSuccess = () => {
    if (vehicleId) {
      navigate(paths.dashboard.vehicle.details(vehicleId));
    } else {
      navigate(paths.dashboard.vehicle.documents);
    }
  };

  const handleCancel = () => {
    if (vehicleId) {
      navigate(paths.dashboard.vehicle.details(vehicleId));
    } else {
      navigate(paths.dashboard.vehicle.documents);
    }
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Add New Vehicle Document"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Documents List', href: paths.dashboard.vehicle.documents },
          { name: 'Add New Document' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Container maxWidth="md">
        <Card sx={{ p: 4 }}>
          <VehicleDocumentForm
            mode="create"
            doc={docType ? { docType } : null}
            initialVehicle={vehicle || null}
            disableVehicleSelection={!!vehicleId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </Card>
      </Container>
    </DashboardContent>
  );
}
