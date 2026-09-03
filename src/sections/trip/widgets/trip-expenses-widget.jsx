import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

import { usePaginatedExpenses } from 'src/query/use-expense';

import { Scrollbar } from 'src/components/scrollbar';
import {
  useTable,
  TableNoData,
  TableSkeleton,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

export function TripExpensesWidget({ tripId, title = 'Expenses', ...other }) {
  const table = useTable({ defaultOrderBy: 'date', defaultRowsPerPage: 5 });

  const { data, isLoading } = usePaginatedExpenses({
    tripId,
    page: table.page + 1,
    rowsPerPage: table.rowsPerPage,
  });

  const expenses = data?.expenses || [];
  const totalCount = data?.totals?.all?.count || 0;

  return (
    <Card {...other}>
      <CardHeader title={title} subheader="Expenses incurred for this trip" sx={{ mb: 3 }} />

      <Scrollbar sx={{ minHeight: 401, maxHeight: 401 }}>
        <Table sx={{ minWidth: 680 }}>
          <TableHeadCustom
            headLabel={[
              { id: 'index', label: 'No.' },
              { id: 'subtrip', label: 'LR No' },
              { id: 'type', label: 'Expense Type' },
              { id: 'dieselLtr', label: 'Diesel Ltr' },
              { id: 'date', label: 'Date' },
              { id: 'amount', label: 'Amount', align: 'right' },
            ]}
          />
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : expenses.length ? (
              <>
                {expenses.map((row, idx) => (
                  <TableRow key={row._id}>
                    <TableCell>{table.page * table.rowsPerPage + idx + 1}</TableCell>
                    <TableCell>
                      {row?.subtripId?.subtripNo ? (
                        <Link
                          component={RouterLink}
                          to={paths.dashboard.subtrip.details(row?.subtripId?._id)}
                          variant="body2"
                          noWrap
                          sx={{ color: 'primary.main' }}
                        >
                          {row?.subtripId?.subtripNo}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{row.expenseType || '-'}</TableCell>
                    <TableCell>{row.dieselLtr || '-'}</TableCell>
                    <TableCell>{row.date ? fDate(new Date(row.date)) : '-'}</TableCell>
                    <TableCell align="right">{fNumber(row.amount)}</TableCell>
                  </TableRow>
                ))}
              </>
            ) : (
              <TableNoData notFound />
            )}
          </TableBody>
        </Table>
      </Scrollbar>

      <TablePaginationCustom
        count={totalCount}
        page={table.page}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={table.onChangeRowsPerPage}
        dense={table.dense}
        onChangeDense={table.onChangeDense}
      />
    </Card>
  );
}

export default TripExpensesWidget;
