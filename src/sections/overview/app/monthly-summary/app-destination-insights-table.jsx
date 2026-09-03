import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import { TableRow, TableCell } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fNumber } from 'src/utils/format-number';

import { useMonthlyDestinationSubtrips } from 'src/query/use-dashboard';

import { Scrollbar } from 'src/components/scrollbar';
import { TableNoData, TableSkeleton, TableHeadCustom } from 'src/components/table';

export function AppDestinationInsightsTable({ month, ...other }) {
  const effectiveMonth = month || dayjs().format('YYYY-MM');

  const { data: summary = [], isLoading } = useMonthlyDestinationSubtrips(effectiveMonth);

  return (
    <Box {...other}>
      <Scrollbar sx={{ minHeight: 402, maxHeight: 402 }}>
        <Table sx={{ minWidth: 680 }}>
          <TableHeadCustom
            headLabel={[
              { id: 'index', label: 'No.' },
              { id: 'destination', label: 'Destination' },
              { id: 'totalWeight', label: 'Total Weight', align: 'center' },
              { id: 'received', label: 'completed Jobs', align: 'center' },
            ]}
          />
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : summary.length ? (
              <>
                {summary.map((row, idx) => (
                  <TableRow key={row.destination}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{row.destination}</TableCell>
                    <TableCell align="center">{fNumber(row.totalLoadingWeight)}</TableCell>
                    <TableCell align="center">
                      <Link
                        component={RouterLink}
                        href={`${paths.dashboard.subtrip.list}?unloadingPoint=${encodeURIComponent(
                          row.destination
                        )}&fromDate=${dayjs(effectiveMonth)
                          .startOf('month')
                          .format('YYYY-MM-DD')}&toDate=${dayjs(effectiveMonth)
                          .endOf('month')
                          .format('YYYY-MM-DD')}&subtripStatus=received,billed`}
                        underline="always"
                        color="primary"
                      >
                        {row.received}
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
                    {summary.reduce((sum, r) => sum + r.received, 0)}
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
