import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDateRangeShortLabel } from 'src/utils/format-time';

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

export function DriverSubtripsTable({ driver }) {
  const { _id: driverId } = driver || {};
  const table = useTable({ defaultOrderBy: 'createDate', defaultRowsPerPage: 5 });

  const { data, isLoading } = usePaginatedSubtrips({
    page: table.page + 1,
    rowsPerPage: table.rowsPerPage,
    driverId,
  });

  const subtrips = data?.results || [];
  const totalCount = data?.total || 0;

  return (
    <Card>
      <CardHeader title="🧾 Jobs" subheader="Jobs done by this driver" sx={{ mb: 3 }} />

      <Scrollbar sx={{ minHeight: 402, maxHeight: 402 }}>
        <Table sx={{ minWidth: 720 }}>
          <TableHeadCustom
            headLabel={[
              { id: 'index', label: 'No.' },
              { id: 'id', label: 'Job' },
              { id: 'vehicleNo', label: 'Vehicle' },
              { id: 'driverName', label: 'Driver' },
              { id: 'loadingPoint', label: 'Loading' },
              { id: 'unloadingPoint', label: 'Unloading' },
              { id: 'time', label: 'time' },
              { id: 'status', label: 'Status' },
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
                    <TableCell>{row?.vehicleId?.vehicleNo}</TableCell>

                    <TableCell>{row?.driverId?.driverName}</TableCell>
                    <TableCell>{row.loadingPoint}</TableCell>
                    <TableCell>{row.unloadingPoint}</TableCell>
                    <TableCell>{fDateRangeShortLabel(row.startDate, row.endDate)}</TableCell>

                    <TableCell>
                      <Label
                        variant="soft"
                        color={SUBTRIP_STATUS_COLORS[row?.subtripStatus] || 'default'}
                      >
                        {row?.subtripStatus}
                      </Label>
                    </TableCell>
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

export default DriverSubtripsTable;
