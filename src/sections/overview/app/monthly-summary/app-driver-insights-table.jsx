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

import { useMonthlyDriverSubtrips } from 'src/query/use-dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableNoData, TableSkeleton, TableHeadCustom } from 'src/components/table';

export function DriverInsightsTable({ month: controlledMonth, ...other }) {
  const defaultMonth = dayjs().format('YYYY-MM');
  const [showAll, setShowAll] = useState(false);
  const effectiveMonth = controlledMonth || defaultMonth;
  const { data: summary = [], isLoading } = useMonthlyDriverSubtrips(effectiveMonth);
  const displayedSummary = showAll ? summary : summary.slice(0, 6);

  return (
    <Box {...other}>
      <Scrollbar sx={{ minHeight: 402, ...(showAll && { maxHeight: 402 }) }}>
        <Table sx={{ minWidth: 480 }}>
          <TableHeadCustom
            headLabel={[
              { id: 'index', label: 'No.' },
              { id: 'driverName', label: 'Driver' },
              { id: 'subtripCount', label: 'Jobs' },
              { id: 'totalWeight', label: 'Total Weight' },
            ]}
          />
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : summary.length ? (
              <>
                {displayedSummary.map((row, idx) => (
                  <TableRow key={row.driverId}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <Link
                        component={RouterLink}
                        to={paths.dashboard.driver.details(row.driverId)}
                        variant="body2"
                        noWrap
                        sx={{ color: 'primary.main' }}
                      >
                        {row.driverName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        component={RouterLink}
                        to={`${paths.dashboard.subtrip.list}?driverId=${row.driverId}&fromDate=${dayjs(`${effectiveMonth}-01`).startOf('month').toISOString()}&toDate=${dayjs(`${effectiveMonth}-01`).endOf('month').toISOString()}&subtripStatus=received,billed`}
                        variant="body2"
                        noWrap
                        sx={{ color: 'primary.main' }}
                      >
                        {row.subtripCount}
                      </Link>
                    </TableCell>
                    <TableCell>{fNumber(row.totalLoadingWeight)}</TableCell>
                  </TableRow>
                ))}
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
