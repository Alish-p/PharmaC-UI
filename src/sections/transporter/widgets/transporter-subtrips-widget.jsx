import dayjs from 'dayjs';
import { useState } from 'react';

import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';

import { usePaginatedSubtrips } from 'src/query/use-subtrip';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import {
  useTable,
  TableNoData,
  TableSkeleton,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { SUBTRIP_STATUS_COLORS } from 'src/sections/subtrip/constants';

export function TransporterSubtripsWidget({ transporterId, title = 'Jobs', ...other }) {
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  const table = useTable({ defaultOrderBy: 'createDate', defaultRowsPerPage: 5 });

  const startDate = selectedMonth.startOf('month').format('YYYY-MM-DD');
  const endDate = selectedMonth.endOf('month').format('YYYY-MM-DD');

  const { data, isLoading } = usePaginatedSubtrips({
    page: table.page + 1,
    rowsPerPage: table.rowsPerPage,
    transporterId,
    fromDate: startDate,
    toDate: endDate,
  });

  const subtrips = data?.results || [];
  const totalCount = data?.total || 0;

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader="Jobs completed by this transporter"
        sx={{ mb: 3 }}
        action={
          <DatePicker
            label="Select month"
            views={['year', 'month']}
            openTo="month"
            value={selectedMonth}
            onChange={(newValue) => {
              if (newValue) {
                setSelectedMonth(newValue);
                table.onResetPage();
              }
            }}
            disableFuture
            slotProps={{
              textField: {
                sx: { minWidth: 140 },
              },
            }}
          />
        }
      />

      <Scrollbar sx={{ minHeight: 401, maxHeight: 401 }}>
        <Table sx={{ minWidth: 680 }}>
          <TableHeadCustom
            headLabel={[
              { id: 'index', label: 'No.' },
              { id: 'id', label: 'LR No' },
              { id: 'customer', label: 'Customer' },
              { id: 'route', label: 'Route' },
              { id: 'status', label: 'Status', align: 'center' },
              { id: 'date', label: 'Date' },
            ]}
          />
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : subtrips.length ? (
              <>
                {subtrips.map((row, idx) => (
                  <TableRow key={row._id}>
                    <TableCell>{table.page * table.rowsPerPage + idx + 1}</TableCell>
                    <TableCell>
                      <Link
                        component={RouterLink}
                        to={paths.dashboard.subtrip.details(row._id)}
                        variant="body2"
                        noWrap
                        sx={{ color: 'primary.main' }}
                      >
                        {row.subtripNo}
                      </Link>
                    </TableCell>
                    <TableCell>{row.customerId?.customerName || '-'}</TableCell>
                    <TableCell>
                      {row.loadingPoint && row.unloadingPoint
                        ? `${row.loadingPoint} → ${row.unloadingPoint}`
                        : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <Label
                        variant="soft"
                        color={SUBTRIP_STATUS_COLORS[row.subtripStatus] || 'default'}
                      >
                        {row.subtripStatus}
                      </Label>
                    </TableCell>
                    <TableCell>{row.startDate ? fDate(new Date(row.startDate)) : '-'}</TableCell>
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

export default TransporterSubtripsWidget;
