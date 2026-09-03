import dayjs from 'dayjs';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import { LoadingButton } from '@mui/lab';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Collapse from '@mui/material/Collapse';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
import { getTenantLogoUrl } from 'src/utils/tenant-branding';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  useClosePurchaseOrder,
  useRejectPurchaseOrder,
  useApprovePurchaseOrder,
  useReceivePurchaseOrder,
  useCheckInvoiceReferences,
} from 'src/query/use-purchase-order';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useTenantContext } from 'src/auth/tenant';

import { PurchaseOrderToolbar } from '../purchase-order-toolbar';
import { PurchaseOrderStatusStepper } from '../purchase-order-status-stepper';

const STATUS_LABELS = {
  'pending-approval': 'Pending Approval',
  approved: 'Approved',
  'partial-received': 'Partially Received',
  rejected: 'Rejected',
  received: 'Received',
  closed: 'Closed',
};

const STATUS_COLORS = {
  'pending-approval': 'warning',
  approved: 'info',
  'partial-received': 'warning',
  rejected: 'error',
  received: 'success',
  closed: 'default',
};

export function PurchaseOrderDetailView({ purchaseOrder }) {
  const {
    _id,
    purchaseOrderNo,
    vendor,
    vendorSnapshot,
    partLocation,
    partLocationSnapshot,
    status,
    lines = [],
    description,
    subtotal,
    discountType,
    discount,
    discountAmount,
    shipping,
    taxType,
    tax,
    taxAmount,
    total,
    createdAt,
    orderDate,
    receipts = [],
  } = purchaseOrder || {};

  const displayVendor = vendorSnapshot || vendor;
  const displayLocation = partLocationSnapshot || partLocation;

  const tenant = useTenantContext();

  const approvePo = useApprovePurchaseOrder();
  const rejectPo = useRejectPurchaseOrder();
  const receivePo = useReceivePurchaseOrder();
  const closePo = useClosePurchaseOrder();

  const approveDialog = useBoolean();
  const rejectDialog = useBoolean();
  const receiveDialog = useBoolean();
  const closeDialog = useBoolean();
  const grnDrawer = useBoolean();

  const isApproving = useBoolean();
  const isRejecting = useBoolean();
  const isReceiving = useBoolean();
  const isClosing = useBoolean();

  const [rejectReason, setRejectReason] = useState('');
  const [receiveLines, setReceiveLines] = useState([]);
  const [receiveNotes, setReceiveNotes] = useState('');
  const [vendorInvoiceNo, setVendorInvoiceNo] = useState('');
  const [vendorInvoiceDate, setVendorInvoiceDate] = useState(null);
  const [closeReason, setCloseReason] = useState('');

  const debouncedInvoiceNo = useDebounce(vendorInvoiceNo, 400);
  const { data: invoiceCheckData } = useCheckInvoiceReferences(
    debouncedInvoiceNo,
    _id,
    { enabled: Boolean(debouncedInvoiceNo && debouncedInvoiceNo.trim().length > 0) }
  );

  const handleCloseRejectDialog = useCallback(() => {
    if (isRejecting.value) return;
    rejectDialog.onFalse();
    setRejectReason('');
  }, [rejectDialog, isRejecting.value]);



  const allFullyReceived =
    Array.isArray(lines) &&
    lines.every((l) => (l.quantityReceived || 0) >= (l.quantityOrdered || 0));

  const actions = [];

  if (status === 'pending-approval') {
    actions.push(
      {
        label: 'Approve',
        icon: 'eva:checkmark-circle-2-outline',
        onClick: approveDialog.onTrue,
      },
      {
        label: 'Reject',
        icon: 'eva:close-circle-outline',
        onClick: rejectDialog.onTrue,
      }
    );
  }

  if (
    (status === 'approved' || status === 'partial-received') &&
    !allFullyReceived
  ) {
    actions.push({
      label: 'Receive Items',
      icon: 'material-symbols:inventory-2-outline',
      onClick: receiveDialog.onTrue,
    });
  }

  if (status === 'partial-received' || status === 'received') {
    actions.push({
      label: 'Close PO',
      icon: 'mdi:lock-outline',
      onClick: closeDialog.onTrue,
    });
  }

  if (receipts && receipts.length > 0) {
    actions.push({
      label: 'GRN History',
      icon: 'material-symbols:history',
      onClick: grnDrawer.onTrue,
      color: 'inherit',
    });
  }

  const statusLabel = STATUS_LABELS[status] || status;
  const statusColor = STATUS_COLORS[status] || 'default';
  const displayDate = orderDate || createdAt;
  const displayPoNo = purchaseOrderNo || '';

  useEffect(() => {
    if (receiveDialog.value) {
      setReceiveLines(
        (lines || []).map((line, index) => {
          const totalOrdered = line.quantityOrdered || 0;
          const totalReceived = line.quantityReceived || 0;
          const remaining = Math.max(totalOrdered - totalReceived, 0);
          const partName = line.partSnapshot?.name ?? line.part?.name ?? 'Unknown Part';
          const unit = line.partSnapshot?.measurementUnit ?? line.part?.measurementUnit ?? '-';
          const isTyre = (line.partSnapshot?.category ?? line.part?.category) === 'Tires';
          const manufacturer = line.partSnapshot?.manufacturer ?? line.part?.manufacturer ?? '';

          // For tyre lines, create empty tyre detail entries
          const tyreDetails = isTyre
            ? Array.from({ length: remaining }, () => ({
                serialNumber: '',
                model: '',
                size: '',
                type: 'New',
                originalThreadDepth: 0,
                brand: manufacturer,
              }))
            : null;

          const poUnitCost = line.unitCost || 0;

          return {
            lineId: line._id || String(index),
            partName,
            totalOrdered,
            totalReceived,
            poUnitCost,
            actualUnitCost: poUnitCost,
            unit,
            receiveQty: remaining,
            checked: remaining > 0,
            isTyre,
            manufacturer,
            tyreDetails,
          };
        })
      );
      setReceiveNotes('');
      setVendorInvoiceNo('');
      setVendorInvoiceDate(null);
    }
  }, [receiveDialog.value, lines]);

  const handleToggleReceiveLine = useCallback((lineId) => {
    setReceiveLines((prev) =>
      prev.map((line) => (line.lineId === lineId ? { ...line, checked: !line.checked } : line))
    );
  }, []);

  const handleChangeReceiveQty = useCallback((lineId, value) => {
    setReceiveLines((prev) =>
      prev.map((line) => {
        if (line.lineId !== lineId) return line;
        const raw = Number(value);
        const safeValue = Number.isNaN(raw) ? 0 : Math.max(raw, 0);

        // For tyre lines, resize the tyreDetails array to match new qty
        let { tyreDetails } = line;
        if (line.isTyre) {
          const currentLen = (tyreDetails || []).length;
          if (safeValue > currentLen) {
            tyreDetails = [
              ...(tyreDetails || []),
              ...Array.from({ length: safeValue - currentLen }, () => ({
                serialNumber: '',
                model: '',
                size: '',
                type: 'New',
                originalThreadDepth: 0,
                brand: line.manufacturer,
              })),
            ];
          } else if (safeValue < currentLen) {
            tyreDetails = (tyreDetails || []).slice(0, safeValue);
          }
        }

        return { ...line, receiveQty: safeValue, tyreDetails };
      })
    );
  }, []);

  const handleChangeActualCost = useCallback((lineId, value) => {
    setReceiveLines((prev) =>
      prev.map((line) => {
        if (line.lineId !== lineId) return line;
        const raw = Number(value);
        return { ...line, actualUnitCost: Number.isNaN(raw) ? 0 : Math.max(raw, 0) };
      })
    );
  }, []);

  // Handler for updating individual tyre detail fields
  const handleChangeTyreDetail = useCallback((lineId, tyreIndex, field, value) => {
    setReceiveLines((prev) =>
      prev.map((line) => {
        if (line.lineId !== lineId || !line.tyreDetails) return line;
        const updatedDetails = [...line.tyreDetails];
        updatedDetails[tyreIndex] = { ...updatedDetails[tyreIndex], [field]: value };
        return { ...line, tyreDetails: updatedDetails };
      })
    );
  }, []);

  const handleApprove = useCallback(async () => {
    if (isApproving.value) return;
    try {
      isApproving.onTrue();
      await approvePo(_id);
      approveDialog.onFalse();
    } catch (error) {
      console.error(error);
    } finally {
      isApproving.onFalse();
    }
  }, [approvePo, _id, approveDialog, isApproving]);

  const handleReject = useCallback(async () => {
    if (isRejecting.value) return;
    try {
      isRejecting.onTrue();
      await rejectPo({ id: _id, reason: rejectReason || '' });
      handleCloseRejectDialog();
    } catch (error) {
      console.error(error);
    } finally {
      isRejecting.onFalse();
    }
  }, [rejectPo, _id, rejectReason, handleCloseRejectDialog, isRejecting]);



  const handleReceiveAll = useCallback(async () => {
    if (isReceiving.value) return;
    try {
      const selectedLines = receiveLines.filter((line) => line.checked && line.receiveQty > 0);
      if (!selectedLines.length) {
        receiveDialog.onFalse();
        return;
      }
      isReceiving.onTrue();

      const payload = {
        lines: selectedLines.map((line) => ({
          lineId: line.lineId,
          quantityToReceive: line.receiveQty,
          actualUnitCost: line.actualUnitCost,
          ...(line.isTyre && line.tyreDetails
            ? { tyreDetails: line.tyreDetails.slice(0, line.receiveQty) }
            : {}),
        })),
        vendorInvoiceNo: vendorInvoiceNo && vendorInvoiceNo.trim() ? vendorInvoiceNo.trim() : undefined,
        vendorInvoiceDate: vendorInvoiceDate
          ? (dayjs.isDayjs(vendorInvoiceDate) ? vendorInvoiceDate.toDate() : new Date(vendorInvoiceDate))
          : undefined,
        notes: receiveNotes || undefined,
      };

      await receivePo({ id: _id, ...payload });
      receiveDialog.onFalse();
    } catch (error) {
      console.error(error);
    } finally {
      isReceiving.onFalse();
    }
  }, [receivePo, _id, receiveLines, receiveNotes, vendorInvoiceNo, vendorInvoiceDate, receiveDialog, isReceiving]);

  const handleClosePo = useCallback(async () => {
    if (isClosing.value) return;
    try {
      isClosing.onTrue();
      await closePo({ id: _id, closeReason: closeReason || '' });
      closeDialog.onFalse();
    } catch (error) {
      console.error('Mutation error:', error);
    } finally {
      isClosing.onFalse();
    }
  }, [closePo, _id, closeReason, closeDialog, isClosing]);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={`Purchase Order${displayPoNo ? ` ${displayPoNo}` : ''}`}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Purchase Orders', href: paths.dashboard.purchaseOrder.list },
          { name: displayVendor?.name || 'Purchase Order' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PurchaseOrderToolbar purchaseOrder={purchaseOrder} actions={actions} />

      <Stack spacing={3} sx={{ mt: 3 }}>
        <PurchaseOrderStatusStepper status={status} />

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
                {statusLabel || 'Draft'}
              </Label>
              <Typography variant="h6">Purchase Order {[displayPoNo]}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {displayDate ? fDate(displayDate) : '-'}
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
                To (Vendor):
              </Typography>
              {displayVendor ? (
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2">{displayVendor?.name}</Typography>
                  {displayVendor?.address && (
                    <Typography variant="body2">{displayVendor.address}</Typography>
                  )}
                  {displayVendor?.phone && (
                    <Typography variant="body2">Phone: {displayVendor.phone}</Typography>
                  )}
                  {displayVendor?.gstNumber && (
                    <Typography variant="body2">GST No: {displayVendor.gstNumber}</Typography>
                  )}
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  -
                </Typography>
              )}
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
                Delivery Location
              </Typography>
              <Typography variant="subtitle2">{displayLocation?.name || '-'}</Typography>
            </Stack>

            <Stack sx={{ width: 1 }}>
              <Typography variant="subtitle2" color="green" sx={{ mb: 1 }}>
                Order Date
              </Typography>
              <Typography variant="subtitle2">{displayDate ? fDate(displayDate) : '-'}</Typography>
            </Stack>
          </Stack>
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle2" color="green" sx={{ mb: 1 }}>
              Line Items
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Part</TableCell>
                  <TableCell>Part No.</TableCell>
                  <TableCell align="right">Qty Ordered</TableCell>
                  <TableCell align="right">Qty Received</TableCell>
                  <TableCell align="right">PO Cost</TableCell>
                  <TableCell align="right">PO Amount</TableCell>
                  {receipts.length > 0 && (
                    <>
                      <TableCell align="right">Actual Avg Cost</TableCell>
                      <TableCell align="right">Actual Amount</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {lines.map((line, idx) => {
                  const displayPartName =
                    line.partSnapshot?.name ?? line.part?.name ?? 'Unknown Part';
                  const displayPartNumber =
                    line.partSnapshot?.partNumber ?? line.part?.partNumber ?? '-';
                  const displayUnit =
                    line.partSnapshot?.measurementUnit ?? line.part?.measurementUnit ?? '-';

                  // Compute weighted avg actual cost for this line from GRN receipts
                  let avgActualCost = null;
                  let actualAmount = null;
                  if (receipts.length > 0) {
                    let totalCost = 0;
                    let totalQty = 0;
                    receipts.forEach((grn) => {
                      const grnLine = grn.lines?.find(
                        (l) => l.lineId?.toString() === line._id?.toString()
                      );
                      if (grnLine && grnLine.quantityReceived > 0) {
                        totalCost += (grnLine.actualUnitCost || 0) * grnLine.quantityReceived;
                        totalQty += grnLine.quantityReceived;
                      }
                    });
                    if (totalQty > 0) {
                      avgActualCost = totalCost / totalQty;
                      actualAmount = totalCost;
                    }
                  }

                  const poCost = line.unitCost || 0;
                  const hasVariance =
                    avgActualCost !== null && Math.abs(avgActualCost - poCost) > 0.001;
                  const variancePct = hasVariance ? ((avgActualCost - poCost) / poCost) * 100 : 0;
                  const varianceColor =
                    variancePct > 5
                      ? 'warning.main'
                      : variancePct > 0
                        ? 'text.secondary'
                        : 'success.main';

                  return (
                    <TableRow key={line._id || idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        {line.part?._id ? (
                          <Link
                            component={RouterLink}
                            to={paths.dashboard.part.details(line.part._id)}
                            variant="body2"
                            noWrap
                            sx={{ color: 'success.dark', fontWeight: 600 }}
                          >
                            {displayPartName}
                          </Link>
                        ) : (
                          <Typography variant="body2">{displayPartName}</Typography>
                        )}
                      </TableCell>
                      <TableCell>{displayPartNumber}</TableCell>
                      <TableCell align="right">
                        {line.quantityOrdered}
                        {displayUnit !== '-' ? ` ${displayUnit}` : ''}
                      </TableCell>
                      <TableCell align="right">
                        {line.quantityReceived || 0}
                        {displayUnit !== '-' ? ` ${displayUnit}` : ''}
                      </TableCell>
                      <TableCell align="right">{fCurrency(poCost)}</TableCell>
                      <TableCell align="right">{fCurrency(line.amount || 0)}</TableCell>
                      {receipts.length > 0 && (
                        <>
                          <TableCell align="right">
                            {avgActualCost !== null ? (
                              <Box>
                                <Typography variant="body2">{fCurrency(avgActualCost)}</Typography>
                                {hasVariance && (
                                  <Typography variant="caption" sx={{ color: varianceColor }}>
                                    {variancePct > 0 ? '+' : ''}
                                    {variancePct.toFixed(1)}%
                                  </Typography>
                                )}
                              </Box>
                            ) : (
                              <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                —
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {actualAmount !== null ? (
                              fCurrency(actualAmount)
                            ) : (
                              <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                —
                              </Typography>
                            )}
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  );
                })}
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
                  Order Description
                </Typography>
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      color: description ? 'text.primary' : 'text.disabled',
                      lineHeight: 1.7,
                      display: '-webkit-box',
                      WebkitLineClamp: 8,
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
                  Order Summary
                </Typography>
                <Stack spacing={1.5} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                  <SummaryRow label="Subtotal" value={fCurrency(subtotal || 0)} />
                  {discount > 0 && (
                    <SummaryRow
                      label={`Discount ${discountType === 'percentage' ? `(${discount}%)` : ''}`}
                      value={`- ${fCurrency(
                        discountAmount ??
                          (discountType === 'percentage'
                            ? ((subtotal || 0) * (discount || 0)) / 100
                            : discount || 0)
                      )}`}
                      color="success.main"
                    />
                  )}
                  {shipping > 0 && <SummaryRow label="Shipping" value={fCurrency(shipping || 0)} />}
                  {tax > 0 && (
                    <SummaryRow
                      label={`Tax ${taxType === 'percentage' ? `(${tax}%)` : ''}`}
                      value={fCurrency(
                        taxAmount ??
                          (() => {
                            const effectiveDiscount =
                              discountAmount ??
                              (discountType === 'percentage'
                                ? ((subtotal || 0) * (discount || 0)) / 100
                                : discount || 0);
                            const taxableBase = Math.max(
                              (subtotal || 0) - (effectiveDiscount || 0),
                              0
                            );
                            return taxType === 'percentage'
                              ? (taxableBase * (tax || 0)) / 100
                              : tax || 0;
                          })()
                      )}
                    />
                  )}
                  <Divider sx={{ my: 0.5 }} />
                  <SummaryRow label="PO Total" value={fCurrency(total || 0)} bold highlight />
                  {receipts.length > 0 &&
                    (() => {
                      const actualReceivedTotal = receipts.reduce(
                        (sum, grn) => sum + (grn.totalAmount || 0),
                        0
                      );
                      const totalVariance = actualReceivedTotal - (total || 0);
                      return (
                        <>
                          <SummaryRow
                            label="Actual Received Total"
                            value={fCurrency(actualReceivedTotal)}
                            bold
                            color="info.main"
                          />
                          <SummaryRow
                            label="Variance"
                            value={`${totalVariance > 0 ? '+' : ''}${fCurrency(totalVariance)}`}
                            color={
                              totalVariance > 0
                                ? 'warning.main'
                                : totalVariance < 0
                                  ? 'success.main'
                                  : 'text.secondary'
                            }
                          />
                        </>
                      );
                    })()}
                </Stack>
              </Stack>
            </Card>
          </Box>
        </Card>
      </Stack>

      <ConfirmDialog
        open={approveDialog.value}
        onClose={isApproving.value ? undefined : approveDialog.onFalse}
        title="Approve purchase order"
        content="Are you sure you want to approve this purchase order?"
        action={
          <LoadingButton
            variant="contained"
            color="primary"
            onClick={handleApprove}
            loading={isApproving.value}
          >
            Approve
          </LoadingButton>
        }
      />

      <ConfirmDialog
        open={rejectDialog.value}
        onClose={isRejecting.value ? undefined : handleCloseRejectDialog}
        title="Reject purchase order"
        content={
          <>
            <Typography sx={{ mb: 2 }}>
              Are you sure you want to reject this purchase order?
            </Typography>
            <TextField
              autoFocus
              fullWidth
              multiline
              minRows={2}
              label="Reason (optional)"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              disabled={isRejecting.value}
            />
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color="error"
            onClick={handleReject}
            loading={isRejecting.value}
          >
            Reject
          </LoadingButton>
        }
      />



      <ConfirmDialog
        open={receiveDialog.value}
        onClose={receiveDialog.onFalse}
        title="Receive items"
        maxWidth="md"
        fullWidth
        content={
          <>
            <Typography sx={{ mb: 2 }}>Check the box to receive parts into inventory.</Typography>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>Item</TableCell>
                  <TableCell align="right">Total Received</TableCell>
                  <TableCell align="right">Total Ordered</TableCell>
                  <TableCell align="right">PO Cost</TableCell>
                  <TableCell align="right">Actual Cost</TableCell>
                  <TableCell align="right">Receive</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {receiveLines.map((line) => {
                  const remaining = Math.max(line.totalOrdered - line.totalReceived, 0);
                  return (
                    <>
                      <TableRow key={line.lineId}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={line.checked}
                            onChange={() => handleToggleReceiveLine(line.lineId)}
                          />
                        </TableCell>
                        <TableCell>
                          {line.partName}
                          {line.isTyre && (
                            <Typography
                              variant="caption"
                              sx={{ ml: 1, color: 'info.main', fontWeight: 600 }}
                            >
                              (Tyre)
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {line.totalReceived}
                          {line.unit !== '-' ? ` ${line.unit}` : ''}
                        </TableCell>
                        <TableCell align="right">
                          {line.totalOrdered}
                          {line.unit !== '-' ? ` ${line.unit}` : ''}
                        </TableCell>
                        <TableCell align="right">{fCurrency(line.poUnitCost)}</TableCell>
                        <TableCell align="right">
                          <Stack spacing={0.5} alignItems="flex-end">
                            <TextField
                              type="number"
                              size="small"
                              value={line.actualUnitCost}
                              onChange={(event) =>
                                handleChangeActualCost(line.lineId, event.target.value)
                              }
                              inputProps={{
                                min: 0,
                                step: 0.01,
                              }}
                              sx={{ width: 100 }}
                            />
                            {line.poUnitCost > 0 && line.actualUnitCost !== line.poUnitCost && (
                              <Label
                                variant="soft"
                                color={
                                  Math.abs(line.actualUnitCost - line.poUnitCost) /
                                    line.poUnitCost >
                                  0.05
                                    ? 'warning'
                                    : 'default'
                                }
                              >
                                {(
                                  ((line.actualUnitCost - line.poUnitCost) / line.poUnitCost) *
                                  100
                                ).toFixed(1)}
                                %
                              </Label>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={line.receiveQty}
                            onChange={(event) =>
                              handleChangeReceiveQty(line.lineId, event.target.value)
                            }
                            inputProps={{
                              min: 0,
                              step: 1,
                            }}
                            sx={{ width: 100 }}
                            color={line.receiveQty > remaining ? 'warning' : 'primary'}
                            helperText={line.receiveQty > remaining ? 'Over-receiving' : ''}
                            FormHelperTextProps={{ sx: { mx: 0, textAlign: 'right' } }}
                          />
                        </TableCell>
                      </TableRow>

                      {/* Tyre details rows — shown when line is checked and isTyre */}
                      {line.isTyre && line.checked && line.receiveQty > 0 && (
                        <TableRow>
                          <TableCell colSpan={7} sx={{ py: 0 }}>
                            <Collapse in timeout="auto" unmountOnExit>
                              <Box sx={{ py: 2 }}>
                                <Typography
                                  variant="subtitle2"
                                  sx={{ mb: 1.5, color: 'text.secondary' }}
                                >
                                  Enter tyre details for {line.receiveQty} unit
                                  {line.receiveQty > 1 ? 's' : ''}
                                  {line.manufacturer && ` — Brand: ${line.manufacturer}`}
                                </Typography>
                                <Stack spacing={2}>
                                  {(line.tyreDetails || [])
                                    .slice(0, line.receiveQty)
                                    .map((td, idx) => (
                                      <Stack
                                        key={idx}
                                        direction={{ xs: 'column', sm: 'row' }}
                                        spacing={1.5}
                                        alignItems={{ sm: 'center' }}
                                        sx={{
                                          p: 1.5,
                                          borderRadius: 1,
                                          bgcolor: 'background.neutral',
                                          border: (theme) => `1px solid ${theme.palette.divider}`,
                                        }}
                                      >
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            fontWeight: 700,
                                            minWidth: 24,
                                            color: 'text.secondary',
                                          }}
                                        >
                                          #{idx + 1}
                                        </Typography>
                                        <TextField
                                          size="small"
                                          label="Serial No. *"
                                          value={td.serialNumber}
                                          onChange={(e) =>
                                            handleChangeTyreDetail(
                                              line.lineId,
                                              idx,
                                              'serialNumber',
                                              e.target.value
                                            )
                                          }
                                          sx={{ minWidth: 140 }}
                                        />
                                        <TextField
                                          size="small"
                                          label="Model"
                                          value={td.model}
                                          onChange={(e) =>
                                            handleChangeTyreDetail(
                                              line.lineId,
                                              idx,
                                              'model',
                                              e.target.value
                                            )
                                          }
                                          sx={{ minWidth: 120 }}
                                        />
                                        <TextField
                                          size="small"
                                          label="Size"
                                          value={td.size}
                                          onChange={(e) =>
                                            handleChangeTyreDetail(
                                              line.lineId,
                                              idx,
                                              'size',
                                              e.target.value
                                            )
                                          }
                                          sx={{ minWidth: 120 }}
                                        />
                                        <TextField
                                          size="small"
                                          select
                                          label="Type"
                                          value={td.type}
                                          onChange={(e) =>
                                            handleChangeTyreDetail(
                                              line.lineId,
                                              idx,
                                              'type',
                                              e.target.value
                                            )
                                          }
                                          sx={{ minWidth: 100 }}
                                        >
                                          <MenuItem value="New">New</MenuItem>
                                          <MenuItem value="Remolded">Remolded</MenuItem>
                                          <MenuItem value="Used">Used</MenuItem>
                                        </TextField>
                                        <TextField
                                          size="small"
                                          label="Thread (mm)"
                                          type="number"
                                          value={td.originalThreadDepth}
                                          onChange={(e) =>
                                            handleChangeTyreDetail(
                                              line.lineId,
                                              idx,
                                              'originalThreadDepth',
                                              Number(e.target.value) || 0
                                            )
                                          }
                                          inputProps={{ min: 0 }}
                                          sx={{ minWidth: 100 }}
                                        />
                                      </Stack>
                                    ))}
                                </Stack>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>

            <Stack spacing={1.5} sx={{ mt: 3, mb: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Vendor Invoice No. (optional)"
                  placeholder="e.g. INV-2024-001"
                  value={vendorInvoiceNo}
                  onChange={(e) => setVendorInvoiceNo(e.target.value)}
                  helperText="Invoice number printed on vendor provided invoice"
                />
                <DatePicker
                  label="Invoice Date (optional)"
                  value={vendorInvoiceDate}
                  onChange={(newValue) => setVendorInvoiceDate(newValue)}
                  maxDate={dayjs()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText: 'Date printed on vendor invoice',
                    },
                  }}
                />
              </Stack>

              {Boolean(debouncedInvoiceNo && invoiceCheckData?.references?.length > 0) && (
                <Alert severity="info" sx={{ mt: 0.5 }}>
                  <AlertTitle sx={{ typography: 'subtitle2', mb: 0.5 }}>
                    Invoice number &ldquo;{debouncedInvoiceNo}&rdquo; was previously recorded in:
                  </AlertTitle>
                  <Stack spacing={0.5}>
                    {invoiceCheckData.references.map((ref, idx) => (
                      <Typography key={idx} variant="caption" sx={{ display: 'block' }}>
                        • <strong>{ref.purchaseOrderNo}</strong> (Vendor: {ref.vendorName} — GRN #{ref.grnNumber}
                        {ref.receivedAt ? `, received on ${fDate(ref.receivedAt)}` : ''})
                      </Typography>
                    ))}
                  </Stack>
                </Alert>
              )}
            </Stack>

            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Receiving Notes (optional)"
              value={receiveNotes}
              onChange={(event) => setReceiveNotes(event.target.value)}
              disabled={isReceiving.value}
            />
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color="primary"
            onClick={handleReceiveAll}
            loading={isReceiving.value}
          >
            Confirm Receive
          </LoadingButton>
        }
      />

      <ConfirmDialog
        open={closeDialog.value}
        onClose={isClosing.value ? undefined : closeDialog.onFalse}
        title="Close purchase order"
        content={
          <>
            <Typography sx={{ mb: 2 }}>
              Are you sure you want to close this purchase order? You will not be able to receive
              any more items or make further changes.
            </Typography>
            <TextField
              autoFocus
              fullWidth
              multiline
              minRows={2}
              label="Close Reason (optional)"
              value={closeReason}
              onChange={(event) => setCloseReason(event.target.value)}
              disabled={isClosing.value}
            />
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color="primary"
            onClick={handleClosePo}
            loading={isClosing.value}
          >
            Close PO
          </LoadingButton>
        }
      />

      <Drawer
        open={grnDrawer.value}
        onClose={grnDrawer.onFalse}
        anchor="right"
        PaperProps={{
          sx: { width: { xs: 1, sm: 480 }, p: 0, display: 'flex', flexDirection: 'column' },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ p: 2.5, pb: 1 }}
        >
          <Typography variant="h6">Goods Receipt Notes (GRN)</Typography>
          <IconButton onClick={grnDrawer.onFalse}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>

        <Divider />

        <Scrollbar sx={{ p: 3 }}>
          {!receipts || receipts.length === 0 ? (
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', textAlign: 'center', mt: 5 }}
            >
              No items have been received yet.
            </Typography>
          ) : (
            <Stack spacing={4}>
              {receipts.map((grn) => (
                <Card
                  key={grn._id}
                  sx={{ p: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}
                  elevation={0}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="subtitle2">GRN #{grn.grnNumber}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {fDate(grn.receivedAt)}
                    </Typography>
                  </Stack>

                  {grn.receivedBy?.name && (
                    <Typography
                      variant="caption"
                      sx={{ display: 'block', mb: 1, color: 'text.secondary' }}
                    >
                      Received by: {grn.receivedBy.name}
                    </Typography>
                  )}

                  {(grn.vendorInvoiceNo || grn.vendorInvoiceDate) && (
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{
                        mb: 1.5,
                        p: 1,
                        bgcolor: 'background.neutral',
                        borderRadius: 1,
                        border: (theme) => `1px dashed ${theme.palette.divider}`,
                      }}
                    >
                      {grn.vendorInvoiceNo && (
                        <Typography variant="caption">
                          <strong>Invoice No:</strong> {grn.vendorInvoiceNo}
                        </Typography>
                      )}
                      {grn.vendorInvoiceDate && (
                        <Typography variant="caption">
                          <strong>Invoice Date:</strong> {fDate(grn.vendorInvoiceDate)}
                        </Typography>
                      )}
                    </Stack>
                  )}

                  <Stack spacing={1} sx={{ mt: 2 }}>
                    {grn.lines?.map((line, idx) => (
                      <Stack
                        key={idx}
                        direction="row"
                        justifyContent="space-between"
                        sx={{ p: 1, bgcolor: 'background.neutral', borderRadius: 1 }}
                      >
                        <Stack>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {line.partSnapshot?.name || 'Unknown Item'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Qty: {line.quantityReceived}{' '}
                            {line.partSnapshot?.measurementUnit !== '-'
                              ? line.partSnapshot?.measurementUnit
                              : ''}
                          </Typography>
                        </Stack>
                        <Stack alignItems="flex-end">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {fCurrency(line.amount || line.actualUnitCost * line.quantityReceived)}
                          </Typography>
                          {line.priceVariance !== 0 && (
                            <Label
                              size="small"
                              color={line.priceVariance > 0 ? 'error' : 'success'}
                              sx={{ mt: 0.5 }}
                            >
                              {line.priceVariance > 0 ? '+' : ''}
                              {fCurrency(line.priceVariance)} (
                              {(line.priceVariancePercent || 0).toFixed(1)}%)
                            </Label>
                          )}
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>

                  <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2">Total Value</Typography>
                    <Typography variant="subtitle2">{fCurrency(grn.totalAmount)}</Typography>
                  </Stack>

                  {grn.totalVariance !== 0 && (
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mt: 0.5 }}
                    >
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Total Variance
                      </Typography>
                      <Typography
                        variant="body2"
                        color={grn.totalVariance > 0 ? 'error' : 'success'}
                        sx={{ fontWeight: 600 }}
                      >
                        {grn.totalVariance > 0 ? '+' : ''}
                        {fCurrency(grn.totalVariance)}
                      </Typography>
                    </Stack>
                  )}

                  {grn.notes && (
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 2,
                        p: 1,
                        bgcolor: 'warning.lighter',
                        color: 'warning.darker',
                        borderRadius: 1,
                      }}
                    >
                      <strong>Notes:</strong> {grn.notes}
                    </Typography>
                  )}
                </Card>
              ))}
            </Stack>
          )}
        </Scrollbar>
      </Drawer>
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
