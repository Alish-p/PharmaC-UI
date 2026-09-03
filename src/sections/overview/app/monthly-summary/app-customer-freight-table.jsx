import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import { Link, TableRow, TableCell } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fNumber, fShortenNumber } from 'src/utils/format-number';

import { useCustomerMonthlyFreight } from 'src/query/use-dashboard';

import { Scrollbar } from 'src/components/scrollbar';
import { TableNoData, TableSkeleton, TableHeadCustom } from 'src/components/table';

export function CustomerFreightTable({ month, ...other }) {
  const effectiveMonth = month || dayjs().format('YYYY-MM');

  const { data: summary = [], isLoading } = useCustomerMonthlyFreight(effectiveMonth);

  return (
    <Box {...other}>
      <Scrollbar sx={{ minHeight: 402, maxHeight: 402 }}>
        <Table sx={{ minWidth: 680 }}>
          <TableHeadCustom
            headLabel={[
              { id: 'index', label: 'No.' },
              { id: 'customer', label: 'Customer' },
              { id: 'totalWeight', label: 'Total Weight', align: 'center' },
              { id: 'freightAmount', label: 'Freight Amount', align: 'center' },
              { id: 'loaded', label: 'POD Pending', align: 'center' },
              { id: 'error', label: 'Error', align: 'center' },
              { id: 'received', label: 'Received', align: 'center' },
              { id: 'billed', label: 'Invoice Generated', align: 'center' },
            ]}
          />
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : summary.length ? (
              <>
                {summary.map((row, idx) => (
                  <TableRow key={row.customerId}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <Link
                        component={RouterLink}
                        to={paths.dashboard.customer.details(row.customerId)}
                        variant="body2"
                        noWrap
                        sx={{ color: 'primary.main' }}
                      >
                        {row.customerName}
                      </Link>
                    </TableCell>
                    <TableCell align="center">{fNumber(row.totalLoadingWeight)}</TableCell>
                    <TableCell align="center">{fShortenNumber(row.totalFreightAmount)}</TableCell>
                    <TableCell align="center">
                      <Link
                        component={RouterLink}
                        to={`${paths.dashboard.subtrip.list}?customerId=${row.customerId}&fromDate=${dayjs(`${effectiveMonth}-01`).startOf('month').toISOString()}&toDate=${dayjs(`${effectiveMonth}-01`).endOf('month').toISOString()}&subtripStatus=loaded`}
                        variant="body2"
                        noWrap
                        sx={{ color: 'primary.main' }}
                      >
                        {row.subtripCounts?.loaded || '-'}
                      </Link>
                    </TableCell>
                    <TableCell align="center">
                      <Link
                        component={RouterLink}
                        to={`${paths.dashboard.subtrip.list}?customerId=${row.customerId}&fromDate=${dayjs(`${effectiveMonth}-01`).startOf('month').toISOString()}&toDate=${dayjs(`${effectiveMonth}-01`).endOf('month').toISOString()}&subtripStatus=error`}
                        variant="body2"
                        noWrap
                        sx={{ color: 'primary.main' }}
                      >
                        {row.subtripCounts?.error || '-'}
                      </Link>
                    </TableCell>
                    <TableCell align="center">
                      <Link
                        component={RouterLink}
                        to={`${paths.dashboard.subtrip.list}?customerId=${row.customerId}&fromDate=${dayjs(`${effectiveMonth}-01`).startOf('month').toISOString()}&toDate=${dayjs(`${effectiveMonth}-01`).endOf('month').toISOString()}&subtripStatus=received`}
                        variant="body2"
                        noWrap
                        sx={{ color: 'primary.main' }}
                      >
                        {row.subtripCounts?.received || '-'}
                      </Link>
                    </TableCell>
                    <TableCell align="center">
                      <Link
                        component={RouterLink}
                        to={`${paths.dashboard.subtrip.list}?customerId=${row.customerId}&fromDate=${dayjs(`${effectiveMonth}-01`).startOf('month').toISOString()}&toDate=${dayjs(`${effectiveMonth}-01`).endOf('month').toISOString()}&subtripStatus=billed`}
                        variant="body2"
                        noWrap
                        sx={{ color: 'primary.main' }}
                      >
                        {row.subtripCounts?.billed || '-'}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2}>Totals</TableCell>
                  <TableCell align="center">
                    {fNumber(summary.reduce((sum, r) => sum + r.totalLoadingWeight, 0))}
                  </TableCell>
                  <TableCell align="center">
                    {fShortenNumber(summary.reduce((sum, r) => sum + r.totalFreightAmount, 0))}
                  </TableCell>
                  <TableCell align="center">
                    {fNumber(summary.reduce((sum, r) => sum + (r.subtripCounts?.loaded || 0), 0))}
                  </TableCell>
                  <TableCell align="center">
                    {fNumber(summary.reduce((sum, r) => sum + (r.subtripCounts?.error || 0), 0))}
                  </TableCell>
                  <TableCell align="center">
                    {fNumber(summary.reduce((sum, r) => sum + (r.subtripCounts?.received || 0), 0))}
                  </TableCell>
                  <TableCell align="center">
                    {fNumber(summary.reduce((sum, r) => sum + (r.subtripCounts?.billed || 0), 0))}
                  </TableCell>
                </TableRow>
              </>
            ) : (
              <TableNoData notFound />
            )}
          </TableBody>
        </Table>
      </Scrollbar>
    </Box>
  );
}
