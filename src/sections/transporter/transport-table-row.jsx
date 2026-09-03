import React, { useMemo } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { GenericTableRow } from 'src/components/table';

import { TABLE_COLUMNS } from './transporter-table-config';

export default function TransporterTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
  visibleColumns,
  disabledColumns,
  columnOrder,
}) {
  const router = useRouter();

  const handleView = onViewRow ? () => onViewRow(row._id) : undefined;
  const handleEdit = onEditRow ? () => onEditRow(row._id) : undefined;
  const handleDelete = onDeleteRow ? () => onDeleteRow(row._id) : undefined;

  const customActions = useMemo(
    () => [
      {
        label: 'Create Payment',
        icon: 'solar:wallet-bold-duotone',
        onClick: () => {
          const query = new URLSearchParams({
            transporterId: row._id,
            transportName: row.transportName || '',
            address: row.address || '',
            cellNo: row.cellNo || '',
            podCharges: row.podCharges || 0,
          }).toString();
          router.push(`${paths.dashboard.transporterPayment.new}?${query}`);
        },
      },
    ],
    [router, row]
  );

  return (
    <GenericTableRow
      row={row}
      columns={TABLE_COLUMNS}
      selected={selected}
      onSelectRow={onSelectRow}
      onViewRow={handleView}
      onEditRow={handleEdit}
      onDeleteRow={handleDelete}
      customActions={customActions}
      visibleColumns={visibleColumns}
      disabledColumns={disabledColumns}
      columnOrder={columnOrder}
    />
  );
}
