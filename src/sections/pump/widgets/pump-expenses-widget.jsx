import dayjs from 'dayjs';

import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';
import { exportToExcel } from 'src/utils/export-to-excel';

import { usePaginatedExpenses } from 'src/query/use-expense';
import { usePaginatedAdvances } from 'src/query/use-transporter-advance';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { DATE_RANGE_PRESETS, useDateRangePicker, CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import {
  useTable,
  TableNoData,
  TableSkeleton,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

export function PumpExpensesWidget({ pumpId, title = 'Pump Expenses & Advances', ...other }) {
  const table = useTable({ defaultOrderBy: 'date', defaultRowsPerPage: 5 });

  const rangePicker = useDateRangePicker(dayjs().startOf('month'), dayjs());

  const { data: expensesData, isLoading: expensesLoading } = usePaginatedExpenses({
    pumpId,
    startDate: rangePicker.startDate && rangePicker.startDate.format('YYYY-MM-DD'),
    endDate: rangePicker.endDate && rangePicker.endDate.format('YYYY-MM-DD'),
    page: 1,
    rowsPerPage: 100000,
  });

  const { data: advancesData, isLoading: advancesLoading } = usePaginatedAdvances({
    pumpId,
    startDate: rangePicker.startDate && rangePicker.startDate.format('YYYY-MM-DD'),
    endDate: rangePicker.endDate && rangePicker.endDate.format('YYYY-MM-DD'),
    page: 1,
    rowsPerPage: 100000,
  });

  const isLoading = expensesLoading || advancesLoading;

  const rawExpenses = expensesData?.expenses || [];
  const rawAdvances = advancesData?.advances || [];

  const unifiedExpenses = rawExpenses.map((e) => ({
    _id: e._id,
    vehicleNo: e.vehicleId?.vehicleNo || '-',
    isOwn: e.vehicleId?.isOwn ?? true,
    displayType: e.expenseType || '-',
    dieselPrice: e.dieselPrice || '-',
    date: e.date,
    amount: e.amount,
    vehicleObj: e.vehicleId,
  }));

  const unifiedAdvances = rawAdvances.map((a) => ({
    ...a,
    _id: a._id,
    vehicleNo: a.vehicleId?.vehicleNo || '-',
    isOwn: a.vehicleId?.isOwn ?? false,
    displayType: `Advance - ${a.advanceType || '-'}`,
    dieselPrice: a.dieselPrice || '-',
    date: a.date,
    amount: a.amount,
    vehicleObj: a.vehicleId,
  }));

  const combinedItems = [...unifiedExpenses, ...unifiedAdvances].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const totalCount = combinedItems.length;

  const paginatedItems = combinedItems.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const handleChangeStartDate = (newValue) => {
    rangePicker.onChangeStartDate(newValue);
    table.onResetPage();
  };

  const handleChangeEndDate = (newValue) => {
    rangePicker.onChangeEndDate(newValue);
    table.onResetPage();
  };

  const handleApplyRange = (newStart, newEnd) => {
    rangePicker.onApplyRange(newStart, newEnd);
    table.onResetPage();
  };

  const handleDownload = async () => {
    const exportRows = combinedItems.map((row, idx) => ({
      'No.': idx + 1,
      'Vehicle No': row.vehicleNo,
      'Market/Own': row.isOwn ? 'Own' : 'Market',
      'Expense/Advance Type': row.displayType,
      'Fuel Rate': row.dieselPrice ?? '-',
      Date: row.date ? fDate(new Date(row.date)) : '-',
      Amount: typeof row.amount === 'number' ? row.amount : Number(row.amount) || 0,
    }));

    await exportToExcel(exportRows, 'Pump-Transactions');
  };

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader="Expenses and advances incurred at this pump"
        sx={{ mb: 3 }}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={rangePicker.onOpen}
              startIcon={<Iconify icon="solar:calendar-date-bold" />}
            >
              {rangePicker.shortLabel}
            </Button>

            <Button
              variant="outlined"
              color="primary"
              onClick={handleDownload}
              startIcon={<Iconify icon="eva:download-fill" />}
            >
              Download
            </Button>
          </Stack>
        }
      />

      <Scrollbar sx={{ minHeight: 401, maxHeight: 401 }}>
        <Table sx={{ minWidth: 680 }}>
          <TableHeadCustom
            headLabel={[
              { id: 'index', label: 'No.' },
              { id: 'vehicle', label: 'Vehicle No' },
              { id: 'isOwn', label: 'Market/Own' },
              { id: 'type', label: 'Expense/Advance Type' },
              { id: 'dieselRate', label: 'Fuel Rate' },
              { id: 'date', label: 'Date' },
              { id: 'amount', label: 'Amount', align: 'right' },
            ]}
          />

          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : paginatedItems.length ? (
              <>
                {paginatedItems.map((row, idx) => (
                  <TableRow key={row._id}>
                    <TableCell>{table.page * table.rowsPerPage + idx + 1}</TableCell>
                    <TableCell>
                      {row.vehicleObj ? (
                        <Link
                          component={RouterLink}
                          href={paths.dashboard.vehicle.details(row.vehicleObj._id)}
                          color="primary"
                          sx={{
                            fontWeight: 'medium',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          {row.vehicleNo}
                        </Link>
                      ) : (
                        row.vehicleNo
                      )}
                    </TableCell>
                    <TableCell>{row.isOwn ? 'Own' : 'Market'}</TableCell>
                    <TableCell>{row.displayType}</TableCell>
                    <TableCell>{row.dieselPrice}</TableCell>
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
        rowsPerPageOptions={[5, 25, 100, 250]}
      />

      <CustomDateRangePicker
        variant="calendar"
        presets={DATE_RANGE_PRESETS}
        open={rangePicker.open}
        onClose={rangePicker.onClose}
        startDate={rangePicker.startDate}
        endDate={rangePicker.endDate}
        onChangeStartDate={handleChangeStartDate}
        onChangeEndDate={handleChangeEndDate}
        onApplyRange={handleApplyRange}
      />
    </Card>
  );
}

export default PumpExpensesWidget;
