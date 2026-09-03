import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { usePaginatedPurchaseOrders } from 'src/query/use-purchase-order';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableNoData, TableHeadCustom } from 'src/components/table';

// ----------------------------------------------------------------------

const STATUS_CONFIG = {
  'pending-approval': { label: 'Pending Approval', color: 'warning' },
  approved: { label: 'Approved', color: 'info' },
  purchased: { label: 'Purchased', color: 'primary' },
  'partial-received': { label: 'Partially Received', color: 'warning' },
  rejected: { label: 'Rejected', color: 'error' },
  received: { label: 'Received', color: 'success' },
};

const TABLE_HEAD = [
  { id: 'purchaseOrderNo', label: 'PO#' },
  { id: 'status', label: 'Status' },
  { id: 'createdAt', label: 'Date' },
  { id: 'total', label: 'Total', align: 'right' },
];

// ----------------------------------------------------------------------

export function VendorRecentOrdersWidget({ vendorId, onViewMore }) {
  const { data, isLoading } = usePaginatedPurchaseOrders({
    vendor: vendorId,
    page: 1,
    rowsPerPage: 5,
    order: 'desc',
    orderBy: 'createdAt',
  });

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (data?.purchaseOrders) {
      setTableData(data.purchaseOrders);
    } else {
      setTableData([]);
    }
  }, [data]);

  const totalCount = data?.totals?.all?.count || data?.total || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader title="Recent Purchase Orders" />
        <Stack spacing={2} sx={{ p: 3 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={40} />
          ))}
        </Stack>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Recent Purchase Orders"
        subheader={`${totalCount} total orders`}
        sx={{ mb: 2 }}
      />

      <Scrollbar sx={{ maxHeight: 400 }}>
        <Table size="small" dense sx={{ minWidth: 500 }}>
          <TableHeadCustom headLabel={TABLE_HEAD} />
          <TableBody>
            {tableData.length ? (
              tableData.map((po) => (
                <TableRow key={po._id} hover>
                  <TableCell>
                    <Link
                      component={RouterLink}
                      to={paths.dashboard.purchaseOrder.details(po._id)}
                      variant="subtitle2"
                      noWrap
                      sx={{ color: 'primary.main' }}
                    >
                      {po.purchaseOrderNo}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Label variant="soft" color={STATUS_CONFIG[po.status]?.color || 'default'}>
                      {STATUS_CONFIG[po.status]?.label || po.status}
                    </Label>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap>
                      {po.createdAt ? fDate(po.createdAt) : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2">{fCurrency(po.total || 0)}</Typography>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableNoData notFound sx={{ py: 5 }} />
            )}
          </TableBody>
        </Table>
      </Scrollbar>

      {totalCount > 5 && (
        <Box sx={{ p: 1.5, textAlign: 'right' }}>
          <Button
            size="small"
            color="inherit"
            onClick={onViewMore}
            endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} />}
          >
            View all {totalCount} orders
          </Button>
        </Box>
      )}
    </Card>
  );
}
