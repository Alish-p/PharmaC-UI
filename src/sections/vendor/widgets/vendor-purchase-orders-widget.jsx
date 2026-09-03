import { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';

import { usePaginatedPurchaseOrders } from 'src/query/use-purchase-order';

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

// ----------------------------------------------------------------------

const STATUS_CONFIG = {
  'pending-approval': { label: 'Pending Approval', color: 'warning' },
  approved: { label: 'Approved', color: 'info' },
  purchased: { label: 'Purchased', color: 'primary' },
  'partial-received': { label: 'Partially Received', color: 'warning' },
  rejected: { label: 'Rejected', color: 'error' },
  received: { label: 'Received', color: 'success' },
};

const STATUS_TABS = [
  { value: 'all', label: 'All', color: 'default' },
  { value: 'pending-approval', label: 'Pending', color: 'warning' },
  { value: 'approved', label: 'Approved', color: 'info' },
  { value: 'purchased', label: 'Purchased', color: 'primary' },
  { value: 'partial-received', label: 'Partial', color: 'warning' },
  { value: 'received', label: 'Received', color: 'success' },
  { value: 'rejected', label: 'Rejected', color: 'error' },
];

const TABLE_HEAD = [
  { id: 'purchaseOrderNo', label: 'PO#' },
  { id: 'status', label: 'Status' },
  { id: 'total', label: 'Total', align: 'right' },
  { id: 'createdAt', label: 'Created', sortable: true },
  { id: 'partLocation', label: 'Location' },
  { id: 'createdBy', label: 'Created By' },
];

const STATUS_TOTALS_KEY_MAP = {
  all: 'all',
  'pending-approval': 'pendingApproval',
  approved: 'approved',
  purchased: 'purchased',
  'partial-received': 'partialReceived',
  received: 'received',
  rejected: 'rejected',
};

// ----------------------------------------------------------------------

export function VendorPurchaseOrdersWidget({ vendorId, maxRows }) {
  const table = useTable({ defaultOrderBy: 'createdAt', defaultRowsPerPage: maxRows || 10 });
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading } = usePaginatedPurchaseOrders({
    vendor: vendorId,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page: table.page + 1,
    rowsPerPage: table.rowsPerPage,
    order: table.order,
    orderBy: table.orderBy,
  });

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (data?.purchaseOrders) {
      setTableData(data.purchaseOrders);
    } else {
      setTableData([]);
    }
  }, [data]);

  const totals = data?.totals || {};
  const totalCount = totals.all?.count || data?.total || 0;

  const getCount = (status) => {
    const key = STATUS_TOTALS_KEY_MAP[status];
    return totals[key]?.count || 0;
  };

  const handleFilterStatus = useCallback(
    (_event, newValue) => {
      setStatusFilter(newValue);
      table.onResetPage();
    },
    [table]
  );

  const notFound = !tableData.length;

  return (
    <Card>
      <CardHeader
        title="Purchase Orders"
        subheader="All purchase orders from this vendor"
        action={
          <Button
            component={RouterLink}
            href={`${paths.dashboard.purchaseOrder.new}?vendor=${vendorId}`}
            variant="contained"
            size="small"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Purchase Order
          </Button>
        }
      />

      <Tabs value={statusFilter} onChange={handleFilterStatus} sx={{ p: 2 }}>
        {STATUS_TABS.map((tab) => {
          const count = tab.value === 'all' ? totalCount : getCount(tab.value);
          return (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              iconPosition="end"
              icon={
                <Label
                  variant={
                    ((tab.value === 'all' || tab.value === statusFilter) && 'filled') || 'soft'
                  }
                  color={tab.color}
                >
                  {count}
                </Label>
              }
            />
          );
        })}
      </Tabs>

      <Scrollbar sx={{ minHeight: 400, maxHeight: 600 }}>
        <Table size="small" sx={{ minWidth: 720 }}>
          <TableHeadCustom
            headLabel={TABLE_HEAD}
            order={table.order}
            orderBy={table.orderBy}
            onSort={table.onSort}
          />
          <TableBody>
            {isLoading ? (
              Array.from({ length: table.rowsPerPage }).map((_, i) => <TableSkeleton key={i} />)
            ) : tableData.length ? (
              tableData.map((po) => (
                <TableRow key={po._id} hover sx={{ cursor: 'pointer' }}>
                  <TableCell>
                    <ListItemText
                      disableTypography
                      primary={
                        <Link
                          component={RouterLink}
                          to={paths.dashboard.purchaseOrder.details(po._id)}
                          variant="subtitle2"
                          noWrap
                          sx={{ color: 'primary.main' }}
                        >
                          {po.purchaseOrderNo}
                        </Link>
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Label variant="soft" color={STATUS_CONFIG[po.status]?.color || 'default'}>
                      {STATUS_CONFIG[po.status]?.label || po.status}
                    </Label>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2">{fCurrency(po.total || 0)}</Typography>
                  </TableCell>
                  <TableCell>
                    {po.createdAt ? (
                      <>
                        <Typography variant="body2" noWrap>
                          {fDate(po.createdAt)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                          {fTime(po.createdAt)}
                        </Typography>
                      </>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {po.partLocationSnapshot?.name || po.partLocation?.name || '-'}
                  </TableCell>
                  <TableCell>{po.createdBy?.name || '-'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableNoData notFound={notFound} sx={{ py: 10 }} />
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
      />
    </Card>
  );
}
