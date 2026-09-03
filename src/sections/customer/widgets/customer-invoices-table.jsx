import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { usePaginatedInvoices } from 'src/query/use-invoice';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import {
  useTable,
  TableNoData,
  TableSkeleton,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

export function CustomerInvoicesTable({ customer, title, subheader, ...other }) {
  const { _id: customerId } = customer || {};
  const table = useTable({ defaultOrderBy: 'createDate', defaultRowsPerPage: 5 });

  const { data, isLoading } = usePaginatedInvoices({
    customerId,
    page: table.page + 1,
    rowsPerPage: table.rowsPerPage,
  });

  const invoices = data?.invoices || [];
  const totalCount = data?.totals?.all?.count || 0;

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

      <Scrollbar sx={{ minHeight: 401, maxHeight: 401 }}>
        <Table sx={{ minWidth: 720 }}>
          <TableHeadCustom
            headLabel={[
              { id: 'index', label: 'No.' },
              { id: 'invoiceNo', label: 'Invoice' },
              { id: 'invoiceStatus', label: 'Status', align: 'center' },
              { id: 'issueDate', label: 'Issue Date' },
              { id: 'dueDate', label: 'Due Date' },
              { id: 'netTotal', label: 'Amount', align: 'right' },
            ]}
          />

          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : invoices.length ? (
              <>
                {invoices.map((row, idx) => {
                  const invoiceNo = row.invoiceNo || row.invoiceNumber;
                  const invoiceStatus = row.invoiceStatus || row.status;
                  const issueDate = row.issueDate || row.invoiceDate;
                  const amount = row.netTotal ?? row.totalAmount;

                  return (
                    <TableRow key={row._id}>
                      <TableCell>{table.page * table.rowsPerPage + idx + 1}</TableCell>

                      <TableCell>
                        <Link
                          component={RouterLink}
                          to={paths.dashboard.invoice.details(row._id)}
                          variant="body2"
                          noWrap
                          sx={{ color: 'primary.main' }}
                        >
                          {invoiceNo}
                        </Link>
                      </TableCell>

                      <TableCell align="center">
                        <Label
                          variant="soft"
                          color={
                            invoiceStatus === 'paid'
                              ? 'success'
                              : invoiceStatus === 'over-due'
                                ? 'error'
                                : 'warning'
                          }
                        >
                          {invoiceStatus}
                        </Label>
                      </TableCell>

                      <TableCell>
                        <ListItemText
                          primary={issueDate ? fDate(new Date(issueDate)) : '-'}
                          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
                        />
                      </TableCell>

                      <TableCell>
                        <ListItemText
                          primary={row.dueDate ? fDate(new Date(row.dueDate)) : '-'}
                          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <ListItemText
                          primary={fCurrency(amount || 0)}
                          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
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

export default CustomerInvoicesTable;
