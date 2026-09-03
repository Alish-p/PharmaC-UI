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

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fDateTimeDuration } from 'src/utils/format-time';

import { usePaginatedWorkOrders } from 'src/query/use-work-order';

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

import { WorkOrderPartsPopoverCell } from 'src/sections/work-order/work-order-parts-popover-cell';
import {
  WORK_ORDER_STATUS_LABELS,
  WORK_ORDER_STATUS_COLORS,
  WORK_ORDER_STATUS_OPTIONS,
  WORK_ORDER_PRIORITY_LABELS,
  WORK_ORDER_PRIORITY_COLORS,
} from 'src/sections/work-order/work-order-config';

// ----------------------------------------------------------------------

const STATUS_TABS = [
  { value: 'all', label: 'All', color: 'default' },
  ...WORK_ORDER_STATUS_OPTIONS.map((s) => ({
    value: s.value,
    label: s.label,
    color: s.color,
  })),
];

const TABLE_HEAD = [
  { id: 'workOrderNo', label: 'WO#' },
  { id: 'category', label: 'Category' },
  { id: 'status', label: 'Status' },
  { id: 'priority', label: 'Priority' },
  { id: 'timeTaken', label: 'Time Taken' },
  { id: 'parts', label: 'Parts', align: 'center' },
  { id: 'scheduledStartDate', label: 'Scheduled' },
  { id: 'totalCost', label: 'Cost', align: 'right' },
];

// ----------------------------------------------------------------------

export function VehicleWorkOrdersWidget({ vehicleId, vehicleNo }) {
  const table = useTable({ defaultOrderBy: 'createdAt', defaultRowsPerPage: 10 });
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading } = usePaginatedWorkOrders({
    vehicle: vehicleId,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page: table.page + 1,
    rowsPerPage: table.rowsPerPage,
    order: table.order,
    orderBy: table.orderBy,
  });

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (data?.workOrders) {
      setTableData(data.workOrders);
    } else {
      setTableData([]);
    }
  }, [data]);

  const totals = data?.totals || {};
  const totalCount = totals.all?.count || data?.total || 0;
  const getCount = (status) => totals[status]?.count || 0;

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
        title="Work Orders"
        subheader="Maintenance history for this vehicle"
        action={
          <Button
            component={RouterLink}
            href={`${paths.dashboard.workOrder.new}?vehicle=${vehicleId}&vehicleNo=${vehicleNo || ''}`}
            variant="contained"
            size="small"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Work Order
          </Button>
        }
      />

      <Tabs value={statusFilter} onChange={handleFilterStatus} sx={{ p: 2.5 }}>
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
              tableData.map((wo) => (
                <TableRow key={wo._id} hover sx={{ cursor: 'pointer' }}>
                  <TableCell>
                    <Link
                      component={RouterLink}
                      to={paths.dashboard.workOrder.details(wo._id)}
                      variant="subtitle2"
                      noWrap
                      sx={{ color: 'primary.main' }}
                    >
                      {wo.workOrderNo}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Label variant="soft" color="default">
                      {wo.category || '-'}
                    </Label>
                  </TableCell>
                  <TableCell>
                    <Label variant="soft" color={WORK_ORDER_STATUS_COLORS[wo.status] || 'default'}>
                      {WORK_ORDER_STATUS_LABELS[wo.status] || wo.status}
                    </Label>
                  </TableCell>
                  <TableCell>
                    <Label
                      variant="soft"
                      color={WORK_ORDER_PRIORITY_COLORS[wo.priority] || 'default'}
                    >
                      {WORK_ORDER_PRIORITY_LABELS[wo.priority] || wo.priority || '-'}
                    </Label>
                  </TableCell>
                  <TableCell>
                    {wo.actualStartDate && wo.completedDate
                      ? fDateTimeDuration(wo.actualStartDate, wo.completedDate)
                      : '-'}
                  </TableCell>
                  <TableCell align="center">
                    <WorkOrderPartsPopoverCell row={wo} />
                  </TableCell>
                  <TableCell>
                    {wo.scheduledStartDate ? fDate(wo.scheduledStartDate) : '-'}
                  </TableCell>
                  <TableCell align="right">{fCurrency(wo.totalCost || 0)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableNoData
                notFound={notFound}
                sx={{
                  py: 10,
                }}
              />
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
