import dayjs from 'dayjs';
import { useState } from 'react';

import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

import { usePaginatedAdvances } from 'src/query/use-transporter-advance';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import {
  useTable,
  TableNoData,
  TableSkeleton,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { useSubtripExpenseTypes, useVehicleExpenseTypes } from 'src/sections/expense/expense-config';

const STATUS_COLORS = {
  Pending: 'warning',
  Recovered: 'success',
};

function AdvanceTypeCell({ advanceType = '-' }) {
  const types = [...useSubtripExpenseTypes(), ...useVehicleExpenseTypes()];
  const matched = types.find((t) => t.label === advanceType);
  const icon = matched?.icon;
  const label = matched?.label || advanceType;
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      {icon ? <Iconify icon={icon} sx={{ color: 'primary.main' }} /> : null}
      <Typography variant="body2" noWrap>
        {label}
      </Typography>
    </Stack>
  );
}

export function TransporterAdvancesWidget({ transporterId, title = 'Advances', ...other }) {
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  const table = useTable({ defaultOrderBy: 'date', defaultRowsPerPage: 5 });

  const startDate = selectedMonth.startOf('month').format('YYYY-MM-DD');
  const endDate = selectedMonth.endOf('month').format('YYYY-MM-DD');

  const { data, isLoading } = usePaginatedAdvances({
    transporterId,
    startDate,
    endDate,
    page: table.page + 1,
    rowsPerPage: table.rowsPerPage,
  });

  const advances = data?.advances || [];
  const totalCount = data?.total || 0;

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader="Advances given for transporter vehicles"
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
              { id: 'subtrip', label: 'LR No' },
              { id: 'status', label: 'Status' },
              { id: 'vehicle', label: 'Vehicle No' },
              { id: 'type', label: 'Advance Type' },
              { id: 'date', label: 'Date' },
              { id: 'amount', label: 'Amount', align: 'right' },
            ]}
          />
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : advances.length ? (
              <>
                {advances.map((row, idx) => (
                  <TableRow key={row._id}>
                    <TableCell>{table.page * table.rowsPerPage + idx + 1}</TableCell>
                    <TableCell>
                      {row.subtripId ? (
                        <Link
                          component={RouterLink}
                          to={paths.dashboard.subtrip.details(row.subtripId._id)}
                          variant="body2"
                          noWrap
                          sx={{ color: 'primary.main' }}
                        >
                          {row.subtripId.subtripNo || '-'}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Label variant="soft" color={STATUS_COLORS[row.status] || 'default'}>
                        {row.status || '-'}
                      </Label>
                    </TableCell>
                    <TableCell>{row.vehicleId?.vehicleNo || row.vehicleNo || '-'}</TableCell>
                    <TableCell>
                      <AdvanceTypeCell advanceType={row.advanceType} />
                    </TableCell>
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

export default TransporterAdvancesWidget;
