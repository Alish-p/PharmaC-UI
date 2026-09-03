import { z as zod } from 'zod';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';

import { paths } from 'src/routes/paths';

import { useCreateBulkTyres } from 'src/query/use-tyre';
import { DashboardContent } from 'src/layouts/dashboard';

import { BulkImportView } from 'src/components/bulk-import';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { generateTyreTemplate } from './tyre-bulk-import-utils';

const FLAT_BULK_TYRE_SCHEMA = zod.object({
  brand: zod.string().min(1, { message: 'Brand is required' }),
  model: zod.string().min(1, { message: 'Model is required' }),
  serialNumber: zod
    .union([zod.string(), zod.number()], {
      errorMap: () => ({ message: 'Tyre Number is required' }),
    })
    .transform(String),
  size: zod
    .union([zod.string(), zod.number()], { errorMap: () => ({ message: 'Size is required' }) })
    .transform(String),
  type: zod.enum(['New', 'Remolded', 'Used'], {
    message: "Type must be 'New', 'Remolded', or 'Used'",
  }),
  category: zod.string().optional(),
  purchaseOrderNumber: zod
    .union([zod.string(), zod.number()])
    .optional()
    .transform((val) => (val !== null && val !== undefined ? String(val) : undefined)),
  currentKm: zod.coerce.number().min(0).optional(),
  cost: zod.coerce.number().min(0).optional(),
  originalThreadDepth: zod.coerce.number().min(0).optional(),
  currentThreadDepth: zod.coerce.number().min(0).optional(),
});

const IMPORT_COLUMNS = [
  { label: 'Brand', key: 'brand', required: true, width: 160 },
  { label: 'Model', key: 'model', required: true, width: 160 },
  { label: 'Serial Number', key: 'serialNumber', required: true, width: 180 },
  { label: 'Size', key: 'size', required: true, width: 140 },
  { label: 'Type (New/Remolded/Used)', key: 'type', required: true, width: 180 },
  { label: 'Category', key: 'category', width: 180 },
  { label: 'Purchase Order No.', key: 'purchaseOrderNumber', width: 200 },
  { label: 'Current KM', key: 'currentKm', type: 'number', width: 220 },
  { label: 'Cost', key: 'cost', type: 'number', width: 120 },
  { label: 'Original Thread Depth', key: 'originalThreadDepth', type: 'number', width: 200 },
  { label: 'Current Thread Depth', key: 'currentThreadDepth', type: 'number', width: 200 },
];

export function TyreBulkImportView() {
  const createBulkTyres = useCreateBulkTyres();

  const handleImport = async (data) => {
    try {
      // Transform flat data to nested API structure
      const formattedData = data.map((item) => ({
        ...item,
        threadDepth: {
          original: item.originalThreadDepth,
          current: item.currentThreadDepth ?? item.originalThreadDepth,
        },
        metadata: {
          isRemoldable: true, // Default to true as column removed
        },
      }));

      await createBulkTyres.mutateAsync({ tyres: formattedData });
      toast.success('Tyres imported successfully!');
    } catch (error) {
      console.error(error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Import failed';
      toast.error(errorMessage);
      throw error; // Re-throw to let the caller (BulkImportView) know it failed
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await generateTyreTemplate();
      saveAs(blob, 'tyre_import_template.xlsx');
    } catch (error) {
      console.error('Error generating template:', error);
    }
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Import Tyres"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Tyres', href: paths.dashboard.tyre.root },
          { name: 'Import' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <BulkImportView
        entityName="Tyre"
        schema={FLAT_BULK_TYRE_SCHEMA}
        columns={IMPORT_COLUMNS}
        onImport={handleImport}
        onDownloadTemplate={handleDownloadTemplate}
      />
    </DashboardContent>
  );
}
