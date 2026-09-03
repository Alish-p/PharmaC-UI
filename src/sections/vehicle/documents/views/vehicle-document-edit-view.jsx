import { useNavigate } from 'react-router';

import Card from '@mui/material/Card';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import VehicleDocumentForm from '../vehicle-document-form';

export function VehicleDocumentEditView({ doc }) {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate(paths.dashboard.vehicle.documentDetails(doc._id));
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit Vehicle Document"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Documents List', href: paths.dashboard.vehicle.documents },
          { name: doc?.docType || 'Document Details', href: paths.dashboard.vehicle.documentDetails(doc?._id) },
          { name: 'Edit' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Container maxWidth="md">
        <Card sx={{ p: 4 }}>
          <VehicleDocumentForm
            mode="edit"
            doc={doc}
            disableVehicleSelection
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </Card>
      </Container>
    </DashboardContent>
  );
}
