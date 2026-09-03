import dayjs from 'dayjs';
import { useState } from 'react';

import Box from '@mui/material/Box';
import { Link } from '@mui/material';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fNumber } from 'src/utils/format-number';

import { useMonthlyTransporterSubtrips } from 'src/query/use-dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableNoData, TableSkeleton, TableHeadCustom } from 'src/components/table';

export function TransporterInsightsTable({ month: controlledMonth, ...other }) {
  const defaultMonth = dayjs().format('YYYY-MM');
  const [showAll, setShowAll] = useState(false);
  const effectiveMonth = controlledMonth || defaultMonth;
  const { data: summary = [], isLoading } = useMonthlyTransporterSubtrips(effectiveMonth);
  const displayedSummary = showAll ? summary : summary.slice(0, 6);

  const totalSubtripCount = summary.reduce((acc, row) => acc + (row.subtripCount || 0), 0);
  const totalLoadingWeight = summary.reduce((acc, row) => acc + (row.totalLoadingWeight || 0), 0);
  const totalCommission = summary.reduce((acc, row) => acc + (row.totalCommission || 0), 0);
  const totalPaymentDone = summary.reduce((acc, row) => acc + (row.paymentDone || 0), 0);
  const totalPendingForPayment = summary.reduce(
    (acc, row) => acc + (row.pendingForPayment || 0),
    0
  );

  return (
    <Box {...other}>
      <Scrollbar sx={{ minHeight: 402, ...(showAll && { maxHeight: 402 }) }}>
        <Table sx={{ minWidth: 680 }}>
          <TableHeadCustom
            headLabel={[
              { id: 'index', label: 'No.' },
              { id: 'transporterName', label: 'Transporter' },
              { id: 'subtripCount', label: 'Jobs' },
              { id: 'totalWeight', label: 'Total Weight' },
              { id: 'commissionAmount', label: 'Commission Amount' },
              { id: 'paymentDone', label: 'Paid' },
              { id: 'pendingForPayment', label: 'Pending' },
            ]}
          />
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : summary.length ? (
              <>
                {displayedSummary.map((row, idx) => (
                  <TableRow key={row.transporterId}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <Link
                        component={RouterLink}
                        to={paths.dashboard.transporter.details(row.transporterId)}
                        variant="body2"
                        noWrap
                        sx={{ color: 'primary.main' }}
                      >
                        {row.transporterName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        component={RouterLink}
                        to={`${paths.dashboard.subtrip.list}?transportName=${row.transporterId}&fromDate=${dayjs(`${effectiveMonth}-01`).startOf('month').toISOString()}&toDate=${dayjs(`${effectiveMonth}-01`).endOf('month').toISOString()}&subtripStatus=received,billed`}
                        variant="body2"
                        noWrap
                        sx={{ color: 'primary.main' }}
                      >
                        {row.subtripCount}
                      </Link>
                    </TableCell>
                    <TableCell>{fNumber(row.totalLoadingWeight)}</TableCell>
                    <TableCell>{fNumber(row.totalCommission)}</TableCell>
                    <TableCell>{row.paymentDone}</TableCell>
                    <TableCell>{row.pendingForPayment}</TableCell>
                  </TableRow>
                ))}

                <TableRow
                  sx={{
                    '& td': { typography: 'subtitle2', color: 'text.primary' },
                    bgcolor: 'background.neutral',
                  }}
                >
                  <TableCell colSpan={2}>Total</TableCell>
                  <TableCell>{totalSubtripCount}</TableCell>
                  <TableCell>{fNumber(totalLoadingWeight)}</TableCell>
                  <TableCell>{fNumber(totalCommission)}</TableCell>
                  <TableCell>{totalPaymentDone}</TableCell>
                  <TableCell>{totalPendingForPayment}</TableCell>
                </TableRow>
              </>
            ) : (
              <TableNoData notFound />
            )}
          </TableBody>
        </Table>
      </Scrollbar>

      {summary.length > 6 && (
        <>
          <Divider sx={{ borderStyle: 'dashed' }} />

          <Box sx={{ p: 2, textAlign: 'right' }}>
            <Button
              size="small"
              color="inherit"
              onClick={() => setShowAll((prev) => !prev)}
              endIcon={
                <Iconify
                  icon={showAll ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-forward-fill'}
                  width={18}
                  sx={{ ml: -0.5 }}
                />
              }
            >
              {showAll ? 'View less' : 'View all'}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
