import { z as zod } from 'zod';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { useBulkUpdateVehicleKm } from 'src/query/use-vehicle';

import { BulkImportView } from 'src/components/bulk-import';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { generateVehicleKmTemplate } from './vehicle-km-bulk-import-utils';

const VEHICLE_KM_SCHEMA = zod.object({
  vehicleNo: zod.string().min(1, { message: 'Vehicle No is required' }),
  currentOdometer: zod.coerce.number().min(0, { message: 'Odometer must be non-negative' }),
});

const IMPORT_COLUMNS = [
  { label: 'Vehicle No', key: 'vehicleNo', required: true, width: 250 },
  { label: 'Current Odometer', key: 'currentOdometer', type: 'number', required: true, width: 250 },
];

export function VehicleKmBulkImportView() {
  const { bulkUpdateVehiclesKm } = useBulkUpdateVehicleKm();

  const handleImport = async (data) => {
    try {
      const formattedData = data.map((item) => ({
        vehicleNo: item.vehicleNo,
        currentOdometer: item.currentOdometer,
      }));

      await bulkUpdateVehiclesKm({ vehicles: formattedData });
    } catch (error) {
      console.error(error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Import failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await generateVehicleKmTemplate();
      saveAs(blob, 'vehicle_km_template.xlsx');
    } catch (error) {
      console.error('Error generating template:', error);
      toast.error('Failed to download template');
    }
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Import Vehicle KM"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Vehicle', href: paths.dashboard.vehicle.root },
          { name: 'Import KM' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <BulkImportView
        entityName="Vehicle KM"
        schema={VEHICLE_KM_SCHEMA}
        columns={IMPORT_COLUMNS}
        onImport={handleImport}
        onDownloadTemplate={handleDownloadTemplate}
      />
    </DashboardContent>
  );
}
