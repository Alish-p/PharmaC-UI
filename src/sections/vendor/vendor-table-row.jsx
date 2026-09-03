import React, { useMemo } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { GenericTableRow } from 'src/components/table';

import { TABLE_COLUMNS } from './vendor-table-config';

export default function VendorTableRow({
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
        label: 'Create Purchase Order',
        icon: 'mdi:cart-plus',
        onClick: () => {
          const query = new URLSearchParams({
            vendor: row._id,
            vendorName: row.name || '',
            vendorAddress: row.address || '',
            vendorPhone: row.phone || '',
          }).toString();
          router.push(`${paths.dashboard.purchaseOrder.new}?${query}`);
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
