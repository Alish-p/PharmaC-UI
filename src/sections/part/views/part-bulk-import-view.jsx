import { z as zod } from 'zod';
import { useMemo } from 'react';
import { saveAs } from 'file-saver';

import { paths } from 'src/routes/paths';

import { useCreateBulkParts } from 'src/query/use-part';
import { DashboardContent } from 'src/layouts/dashboard';
import { usePaginatedPartLocations } from 'src/query/use-part-location';

import { BulkImportView } from 'src/components/bulk-import';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ALLOWED_MEASUREMENT_UNITS } from '../part-constant';
import { generatePartTemplate } from './part-bulk-import-utils';

export function PartBulkImportView() {
  const { createBulkParts, isCreatingBulkParts } = useCreateBulkParts();
  const { data: locationsResponse, isLoading } = usePaginatedPartLocations(
    { page: 1, rowsPerPage: 1000 },
    { staleTime: 1000 * 60 * 10 }
  );

  const locations = useMemo(
    () =>
      locationsResponse?.locations ||
      locationsResponse?.partLocations ||
      locationsResponse?.results ||
      [],
    [locationsResponse]
  );

  const IMPORT_COLUMNS = useMemo(() => {
    const baseColumns = [
      { label: 'Part Number', key: 'partNumber', required: true, width: 180 },
      { label: 'Name', key: 'name', required: true, width: 220 },
      { label: 'Category', key: 'category', width: 180 },
      { label: 'Manufacturer', key: 'manufacturer', width: 180 },
      { label: 'Unit Cost', key: 'unitCost', type: 'number', required: true, width: 140 },
      { label: 'Measurement Unit', key: 'measurementUnit', required: true, width: 160 },
      { label: 'Description', key: 'description', width: 240 },
    ];

    const locationColumns = locations.flatMap((loc) => [
      { label: `${loc.name} Quantity`, key: `loc_${loc._id}_qty`, type: 'number', width: 160 },
      {
        label: `${loc.name} Reorder Point`,
        key: `loc_${loc._id}_threshold`,
        type: 'number',
        width: 180,
      },
    ]);

    return [...baseColumns, ...locationColumns];
  }, [locations]);

  const BulkPartSchema = useMemo(() => {
    const schemaShape = {
      partNumber: zod
        .union([zod.string(), zod.number()])
        .transform(String)
        .refine((val) => val.length > 0, { message: 'Part Number is required' }),
      name: zod.string().min(1, { message: 'Name is required' }),
      category: zod.string().optional(),
      manufacturer: zod.string().optional(),
      unitCost: zod.coerce.number().min(0, { message: 'Unit Cost cannot be negative' }),
      measurementUnit: zod
        .string()
        .min(1, { message: 'Measurement Unit is required' })
        .refine((val) => ALLOWED_MEASUREMENT_UNITS.includes(val), {
          message: `Measurement Unit must be one of: ${ALLOWED_MEASUREMENT_UNITS.join(', ')}`,
        }),
      description: zod.string().optional(),
    };

    locations.forEach((loc) => {
      schemaShape[`loc_${loc._id}_qty`] = zod.coerce.number().min(0).optional();
      schemaShape[`loc_${loc._id}_threshold`] = zod.coerce.number().min(0).optional();
    });

    return zod.object(schemaShape);
  }, [locations]);

  const handleImport = async (data) => {
    try {
      const formattedData = data.map((item) => {
        const inventory = [];
        locations.forEach((loc) => {
          const qtyKey = `loc_${loc._id}_qty`;
          const thresholdKey = `loc_${loc._id}_threshold`;

          const qty = item[qtyKey];
          const threshold = item[thresholdKey];

          if (qty !== undefined || threshold !== undefined) {
            inventory.push({
              inventoryLocation: loc._id,
              quantity: qty || 0,
              threshold: threshold || 0,
            });
          }
        });

        return {
          partNumber: item.partNumber,
          name: item.name,
          category: item.category,
          manufacturer: item.manufacturer,
          unitCost: item.unitCost,
          measurementUnit: item.measurementUnit,
          description: item.description,
          inventory,
        };
      });

      await createBulkParts({ parts: formattedData });
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await generatePartTemplate(locations);
      saveAs(blob, 'part_import_template.xlsx');
    } catch (error) {
      console.error('Error generating template:', error);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Import Parts"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Vehicle Maintenance', href: paths.dashboard.part.root },
          { name: 'Parts', href: paths.dashboard.part.root },
          { name: 'Import' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <BulkImportView
        entityName="Part"
        schema={BulkPartSchema}
        columns={IMPORT_COLUMNS}
        onImport={handleImport}
        onDownloadTemplate={handleDownloadTemplate}
        isImporting={isCreatingBulkParts}
      />
    </DashboardContent>
  );
}
