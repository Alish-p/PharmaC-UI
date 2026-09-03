import { TABLE_COLUMNS } from 'src/sections/vehicle/vehicle-table-config';

import GenericListPdf from './generic-list-pdf';

// ----------------------------------------------------------------------

export default function VehicleListPdf({ vehicles, tenant, visibleColumns = [] }) {
  const defaultIds = [
    'vehicleNo',
    'vehicleType',
    'modelType',
    'vehicleCompany',
    'noOfTyres',
    'chasisNo',
    'engineNo',
    'manufacturingYear',
    'loadingCapacity',
    'fuelTankCapacity',
    'transporter',
  ];

  const ids = visibleColumns.length ? visibleColumns : defaultIds;
  const columnsToShow = ids.map((id) => TABLE_COLUMNS.find((c) => c.id === id)).filter(Boolean);

  return (
    <GenericListPdf
      title="Vehicle List"
      rows={vehicles}
      columns={columnsToShow}
      orientation="landscape"
      tenant={tenant}
      visibleColumns={ids}
    />
  );
}
