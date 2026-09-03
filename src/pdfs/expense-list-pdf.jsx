import { TABLE_COLUMNS } from 'src/sections/expense/expense-table-config';

import GenericListPdf from './generic-list-pdf';

export default function ExpenseListPdf({ expenses, visibleColumns = [], tenant }) {
  const columnsToShow =
    (visibleColumns && visibleColumns.length
      ? visibleColumns.map((id) => TABLE_COLUMNS.find((c) => c.id === id)).filter(Boolean)
      : TABLE_COLUMNS.filter((c) => c.defaultVisible)) || [];

  return (
    <GenericListPdf
      title="Expense List"
      rows={expenses}
      columns={columnsToShow}
      orientation="landscape"
      includeTotals
      tenant={tenant}
      visibleColumns={visibleColumns}
    />
  );
}
