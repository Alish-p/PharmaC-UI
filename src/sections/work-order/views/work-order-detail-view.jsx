import { useMemo, useState, useCallback } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
import { getTenantLogoUrl } from 'src/utils/tenant-branding';

import WorkOrderPdf from 'src/pdfs/work-order-pdf';
import { DashboardContent } from 'src/layouts/dashboard';
import { useAddWorkOrderExpense } from 'src/query/use-work-order';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useTenantContext } from 'src/auth/tenant';

import { WorkOrderStartDialog } from '../work-order-start-dialog';
import { WorkOrderCloseDialog } from '../work-order-close-dialog';
import { WorkOrderStatusStepper } from '../work-order-status-stepper';
import {
  WORK_ORDER_STATUS_LABELS,
  WORK_ORDER_STATUS_COLORS,
  WORK_ORDER_PRIORITY_LABELS,
  WORK_ORDER_PRIORITY_COLORS,
} from '../work-order-config';

export function WorkOrderDetailView({ workOrder }) {
  const router = useRouter();
  const tenant = useTenantContext();
  const closeDialog = useBoolean(false);
  const viewPdf = useBoolean();
  const addWorkOrderExpense = useAddWorkOrderExpense();
  const addExpenseDialog = useBoolean(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  const startWorkDialog = useBoolean(false);

  const {
    _id,
    workOrderNo,
    vehicle,
    status,
    priority,
    category,
    scheduledStartDate,
    actualStartDate,
    completedDate,
    odometerReading,
    labourCharge,
    partsCost,
    totalCost,
    description,
    parts = [],
    createdAt,
    issues = [],
    expenseAdded,
    workshopName,
    billNo,
  } = workOrder || {};

  const statusLabel = WORK_ORDER_STATUS_LABELS[status] || status || 'Unknown';
  const statusColor = WORK_ORDER_STATUS_COLORS[status] || 'default';

  const priorityLabel = WORK_ORDER_PRIORITY_LABELS[priority] || priority || 'Unknown';
  const priorityColor = WORK_ORDER_PRIORITY_COLORS[priority] || 'default';

  const computed = useMemo(
    () => ({
      partsCost: typeof partsCost === 'number' ? partsCost : 0,
      labourCharge: typeof labourCharge === 'number' ? labourCharge : 0,
      totalCost: typeof totalCost === 'number' ? totalCost : 0,
    }),
    [partsCost, labourCharge, totalCost]
  );

  const handleEdit = useCallback(() => {
    if (!_id) return;
    router.push(paths.dashboard.workOrder.edit(_id));
  }, [_id, router]);



  const handleConfirmAddExpense = useCallback(async () => {
    if (!_id) return;
    try {
      setIsAddingExpense(true);
      await addWorkOrderExpense(_id);
      addExpenseDialog.onFalse();
    } catch (error) {
      console.error(error);
    } finally {
      setIsAddingExpense(false);
    }
  }, [_id, addExpenseDialog, addWorkOrderExpense]);



  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={workOrderNo || 'Work Order'}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Work Orders', href: paths.dashboard.workOrder.list },
          { name: workOrderNo || 'Work Order' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack
        spacing={3}
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-end', sm: 'center' }}
        sx={{ mb: { xs: 2 } }}
      >
        <Stack direction="row" spacing={1} flexGrow={1} sx={{ width: 1 }}>
          <Tooltip title="Edit">
            <IconButton onClick={handleEdit}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <Tooltip title="View PDF">
            <IconButton onClick={viewPdf.onTrue}>
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>

          <PDFDownloadLink
            document={<WorkOrderPdf workOrder={workOrder} tenant={tenant} />}
            fileName={workOrderNo || 'work-order'}
            style={{ textDecoration: 'none' }}
          >
            {({ loading }) => (
              <Tooltip title="Download PDF">
                <IconButton>
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <Iconify icon="eva:cloud-download-fill" />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </PDFDownloadLink>

          <Box sx={{ flexGrow: 1 }} />

          {status === 'completed' && !expenseAdded && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Iconify icon="mdi:cash-plus" />}
              onClick={addExpenseDialog.onTrue}
            >
              Add Final Expense
            </Button>
          )}

          {status === 'open' && (
            <Button
              variant="contained"
              color="warning"
              startIcon={<Iconify icon="solar:play-bold" />}
              onClick={startWorkDialog.onTrue}
            >
              Start Work
            </Button>
          )}

          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="mdi:check-decagram-outline" />}
            onClick={closeDialog.onTrue}
            disabled={status !== 'inprogress'}
          >
            {status === 'completed' ? 'Already Closed' : 'Close Work Order'}
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3} sx={{ mt: 3 }}>
        <WorkOrderStatusStepper status={status} />

        <Card sx={{ p: 3 }}>
        <Box
          rowGap={3}
          display="grid"
          alignItems="center"
          gridTemplateColumns={{ xs: '1fr', sm: '1fr auto' }}
          sx={{ mb: 3 }}
        >
          <Box
            component="img"
            alt="logo"
            src={getTenantLogoUrl(tenant)}
            sx={{
              width: 60,
              height: 60,
              bgcolor: 'background.neutral',
              borderRadius: '10px',
            }}
          />
          <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
            <Label variant="soft" color={statusColor}>
              {statusLabel}
            </Label>
            <Typography variant="h6">Work Order</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {workOrderNo ? `Work Order No: ${workOrderNo}` : 'Work Order No: -'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {createdAt ? fDate(createdAt) : '-'}
            </Typography>
          </Stack>
        </Box>

        <Stack
          spacing={{ xs: 3, md: 5 }}
          direction={{ xs: 'column', md: 'row' }}
          divider={<Divider flexItem orientation="vertical" sx={{ borderStyle: 'dashed' }} />}
        >
          <Stack sx={{ width: 1 }}>
            <Typography variant="subtitle2" color="green" sx={{ mb: 1 }}>
              From:
            </Typography>
            <Stack spacing={1}>
              <Typography variant="subtitle2">{tenant?.name}</Typography>
              <Typography variant="body2">{tenant?.address?.line1}</Typography>
              <Typography variant="body2">{tenant?.address?.line2}</Typography>
              <Typography variant="body2">{tenant?.address?.state}</Typography>
              <Typography variant="body2">Phone: {tenant?.contactDetails?.phone}</Typography>
            </Stack>
          </Stack>

          <Stack sx={{ width: 1 }}>
            <Typography variant="subtitle2" color="green" sx={{ mb: 1 }}>
              Vehicle & Assignee:
            </Typography>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" sx={{ color: 'text.secondary', width: 120 }}>
                  Vehicle:
                </Typography>
                <Typography variant="subtitle2">
                  {vehicle?.vehicleNo
                    ? `${vehicle.vehicleNo}${vehicle.vehicleType ? ` (${vehicle.vehicleType})` : ''}`
                    : '-'}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" sx={{ color: 'text.secondary', width: 120 }}>
                  Odometer:
                </Typography>
                <Typography variant="body2">
                  {typeof odometerReading === 'number' ? `${odometerReading} km` : '-'}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" sx={{ color: 'text.secondary', width: 120 }}>
                  Scheduled:
                </Typography>
                <Typography variant="body2">
                  {scheduledStartDate ? fDate(scheduledStartDate) : '-'}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" sx={{ color: 'text.secondary', width: 120 }}>
                  Actual Start:
                </Typography>
                <Typography variant="body2">
                  {actualStartDate ? fDate(actualStartDate) : '-'}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" sx={{ color: 'text.secondary', width: 120 }}>
                  Completed On:
                </Typography>
                <Typography variant="body2">
                  {completedDate ? fDate(completedDate) : '-'}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        <Stack
          spacing={{ xs: 3, md: 5 }}
          direction={{ xs: 'column', md: 'row' }}
          divider={
            <Divider flexItem orientation="vertical" sx={{ borderStyle: 'dashed', mt: 4 }} />
          }
          sx={{ mt: 4 }}
        >
          <Stack sx={{ width: 1 }}>
            <Typography variant="subtitle2" color="green" sx={{ mb: 1 }}>
              Category
            </Typography>
            <Typography variant="subtitle2">{category || '-'}</Typography>
          </Stack>

          <Stack sx={{ width: 1 }}>
            <Typography variant="subtitle2" color="green" sx={{ mb: 1 }}>
              Priority
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor:
                    priorityColor === 'default'
                      ? 'text.disabled'
                      : (theme) => theme.palette[priorityColor]?.main || 'text.disabled',
                }}
              />
              <Typography variant="subtitle2">{priorityLabel}</Typography>
            </Stack>
          </Stack>

          {category === 'External Workshop' && (
            <>
              <Stack sx={{ width: 1 }}>
                <Typography variant="subtitle2" color="green" sx={{ mb: 1 }}>
                  Workshop Name
                </Typography>
                <Typography variant="subtitle2">{workshopName || '-'}</Typography>
              </Stack>
              <Stack sx={{ width: 1 }}>
                <Typography variant="subtitle2" color="green" sx={{ mb: 1 }}>
                  Bill No.
                </Typography>
                <Typography variant="subtitle2">{billNo || '-'}</Typography>
              </Stack>
            </>
          )}
        </Stack>

        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle2" color="green" sx={{ mb: 1 }}>
            Issues
          </Typography>
          {!issues || issues.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No issues recorded for this work order.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {issues.map((issue, index) => (
                <Stack key={index} direction="row" spacing={1} alignItems="flex-start">
                  <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 20 }}>
                    {index + 1}.
                  </Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2">
                      {typeof issue === 'string' ? issue : issue.issue}
                    </Typography>
                    {issue &&
                      typeof issue === 'object' &&
                      Array.isArray(issue.assignedTo) &&
                      issue.assignedTo.length > 0 && (
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}
                        >
                          Assigned to:{' '}
                          {issue.assignedTo
                            .map((user) => user.name || user.customerName)
                            .filter(Boolean)
                            .join(', ')}
                        </Typography>
                      )}
                  </Box>
                </Stack>
              ))}
            </Stack>
          )}
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle2" color="green" sx={{ mb: 1 }}>
            Parts Used
          </Typography>
          {category === 'External Workshop' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Note: Since this work order is categorized as &lsquo;External Workshop&rsquo;,
              inventory for these parts will not be deducted.
            </Alert>
          )}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Part</TableCell>
                <TableCell>Part No.</TableCell>
                <TableCell>Location</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {parts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ color: 'text.secondary' }}>
                    No parts added.
                  </TableCell>
                </TableRow>
              ) : (
                parts.map((line, index) => {
                  const displayPartName =
                    line.partSnapshot?.name ?? line.part?.name ?? 'Unknown Part';
                  const displayPartNumber =
                    line.partSnapshot?.partNumber ?? line.part?.partNumber ?? '-';
                  const displayUnit =
                    line.partSnapshot?.measurementUnit ?? line.part?.measurementUnit ?? '-';

                  return (
                    <TableRow key={line._id || index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {line.part?._id ? (
                          <Link
                            component={RouterLink}
                            to={paths.dashboard.part.details(line.part._id)}
                            variant="body2"
                            noWrap
                            sx={{ color: 'success.dark' }}
                          >
                            {displayPartName}
                          </Link>
                        ) : (
                          <Typography variant="body2">{displayPartName}</Typography>
                        )}
                      </TableCell>
                      <TableCell>{displayPartNumber}</TableCell>
                      <TableCell>{line.partLocation?.name || '-'}</TableCell>
                      <TableCell align="right">
                        {line.quantity || 0}
                        {displayUnit !== '-' ? ` ${displayUnit}` : ''}
                      </TableCell>
                      <TableCell align="right">{fCurrency(line.price || 0)}</TableCell>
                      <TableCell align="right">{fCurrency(line.amount || 0)}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>

        <Box
          sx={{
            mt: 4,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3,
          }}
        >
          <Card variant="outlined" sx={{ p: 2.5, height: 1, bgcolor: 'background.neutral' }}>
            <Stack spacing={1.5} sx={{ height: 1 }}>
              <Typography variant="subtitle2" color="green">
                Description / Notes
              </Typography>
              <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    color: description ? 'text.primary' : 'text.disabled',
                    lineHeight: 1.7,
                    display: '-webkit-box',
                    WebkitLineClamp: 5,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {description || 'No description provided'}
                </Typography>
              </Box>
            </Stack>
          </Card>

          <Card variant="outlined" sx={{ p: 2.5, height: 1, bgcolor: 'background.neutral' }}>
            <Stack spacing={2} sx={{ height: 1 }}>
              <Typography variant="subtitle2" color="green">
                Cost Summary
              </Typography>
              <Stack spacing={1.5} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                <SummaryRow label="Parts Cost" value={fCurrency(computed.partsCost)} />
                <SummaryRow label="Labour Charge" value={fCurrency(computed.labourCharge)} />
                <Divider sx={{ my: 0.5 }} />
                <SummaryRow
                  label="Total Cost"
                  value={fCurrency(computed.totalCost)}
                  bold
                  highlight
                />
              </Stack>
            </Stack>
          </Card>
        </Box>
      </Card>
    </Stack>

      <WorkOrderCloseDialog
        open={closeDialog.value}
        onClose={closeDialog.onFalse}
        workOrder={workOrder}
      />

      <Dialog
        open={addExpenseDialog.value}
        onClose={addExpenseDialog.onFalse}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Final Expense</DialogTitle>
        <DialogContent sx={{ typography: 'body2' }}>
          Are you sure you want to add an expense of{' '}
          <strong>{fCurrency(computed.totalCost)}</strong> to this vehicle? This will use the work
          order closed date.
        </DialogContent>
        <DialogActions>
          <Button onClick={addExpenseDialog.onFalse} disabled={isAddingExpense}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmAddExpense}
            disabled={isAddingExpense}
            startIcon={
              isAddingExpense ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <Iconify icon="mdi:cash-plus" />
              )
            }
          >
            {isAddingExpense ? 'Adding...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      <WorkOrderStartDialog
        open={startWorkDialog.value}
        onClose={startWorkDialog.onFalse}
        workOrder={workOrder}
      />

      <Dialog fullScreen open={viewPdf.value} onClose={viewPdf.onFalse}>
        <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
          <DialogActions sx={{ p: 1.5 }}>
            <Button color="inherit" variant="contained" onClick={viewPdf.onFalse}>
              Close
            </Button>
          </DialogActions>

          <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
            <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
              <WorkOrderPdf workOrder={workOrder} tenant={tenant} />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </DashboardContent>
  );
}

function SummaryRow({ label, value, bold, color, highlight }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography
        variant={bold ? 'subtitle2' : 'body2'}
        sx={{
          color: color || (highlight ? 'primary.main' : 'text.primary'),
          fontWeight: bold || highlight ? 600 : undefined,
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
