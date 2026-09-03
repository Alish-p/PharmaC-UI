/* eslint-disable react/prop-types */
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';

// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { Box, Dialog, MenuList, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSystemFeatures } from 'src/hooks/use-system-features';

import IndentPdf from 'src/pdfs/petrol-pump-indent';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { useTenantContext } from 'src/auth/tenant';

import LRPDF from './pdfs/lorry-reciept-pdf';
import EntryPassPdf from './pdfs/entry-pass-pdf';
import DriverPaymentPdf from './pdfs/driver-payment-pdf';
import TransporterPayment from './pdfs/transporter-payment-pdf';
import { SUBTRIP_STATUS, SUBTRIP_STATUS_COLORS } from './constants';

// ----------------------------------------------------------------------

// PDF Viewer Component
const PDFViewerDialog = ({ open, onClose, children }) => (
  <Dialog fullScreen open={open}>
    <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
      <DialogActions sx={{ p: 1.5 }}>
        <Button color="primary" variant="outlined" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
      <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
        <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
          {children}
        </PDFViewer>
      </Box>
    </Box>
  </Dialog>
);

// PDF Download Menu Item Component
const PDFDownloadMenuItem = ({ document, fileName, label, onClose, disabled }) => (
  <MenuItem onClick={onClose} disabled={disabled}>
    <PDFDownloadLink
      document={document}
      fileName={fileName}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {({ loading }) => (
        <>
          <Iconify icon={loading ? 'line-md:loading-loop' : 'eva:download-fill'} sx={{ mr: 2 }} />
          {label}
        </>
      )}
    </PDFDownloadLink>
  </MenuItem>
);

// Action Button Component
const ActionButton = ({ label, onClick, disabled, startIcon, endIcon }) => (
  <Button
    color="primary"
    variant="outlined"
    onClick={onClick}
    disabled={disabled}
    startIcon={startIcon}
    endIcon={endIcon}
    sx={{ textTransform: 'capitalize' }}
  >
    {label}
  </Button>
);

// ----------------------------------------------------------------------

export default function SubtripToolbar({
  status,
  subtrip,
  onAddMaterialInfo,
  onRecieve,
  onEdit,
  onResolve,
  onCloseEmpty,
  isEditDisabled,
  isEmpty,
}) {
  const getActions = () => {
    if (isEmpty) {
      return [
        {
          label: 'Close Empty Trip',
          icon: 'mdi:close-circle',
          action: onCloseEmpty,
          disabled: isEditDisabled,
        },
      ];
    }

    return [
      {
        label: 'Add Material Info',
        icon: 'mdi:package-variant',
        action: onAddMaterialInfo,
        disabled: status !== SUBTRIP_STATUS.IN_QUEUE,
      },
      {
        label: 'Receive',
        icon: 'mdi:call-received',
        action: onRecieve,
        disabled: status !== SUBTRIP_STATUS.LOADED,
      },

      {
        label: 'Resolve',
        icon: 'mdi:check-circle',
        action: onResolve,
        disabled: status !== SUBTRIP_STATUS.ERROR,
      },
    ];
  };

  const { pumps: managesPumps } = useSystemFeatures();

  const hasDieselIntent = subtrip?.intentFuelPump && managesPumps;
  const hasEntryPass = subtrip?.diNumber;
  const hasTransporterPayment = !subtrip?.vehicleId?.isOwn;

  const actionPopover = usePopover();
  const viewPopover = usePopover();
  const downloadPopover = usePopover();

  const viewLR = useBoolean();
  const viewIntent = useBoolean();
  const viewEntryPass = useBoolean();
  const viewDriverPayment = useBoolean();
  const viewTransporterPayment = useBoolean();
  const tenant = useTenantContext();

  return (
    <>
      <Stack
        spacing={3}
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        <Stack spacing={1} direction="row" alignItems="flex-start">
          <Stack spacing={0.5}>
            <Stack spacing={1} direction="row" alignItems="center">
              <Typography variant="h4">Job #{subtrip.subtripNo} </Typography>
              <Label variant="soft" color={SUBTRIP_STATUS_COLORS[status] || 'default'}>
                {status}
              </Label>
              <Label variant="soft" color={subtrip.vehicleId?.isOwn ? 'success' : 'warning'}>
                {subtrip.vehicleId?.isOwn ? 'Own Job' : 'Market Job'}
              </Label>
            </Stack>
          </Stack>
        </Stack>

        <Stack
          flexGrow={1}
          spacing={1.5}
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
        >
          <ActionButton
            label="Actions"
            endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
            onClick={actionPopover.onOpen}
          />

          <ActionButton
            label="View"
            startIcon={<Iconify icon="solar:eye-bold" />}
            endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
            onClick={viewPopover.onOpen}
          />

          <ActionButton
            label="Download"
            startIcon={<Iconify icon="material-symbols:download" />}
            endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
            onClick={downloadPopover.onOpen}
          />

          <ActionButton
            label="Edit"
            startIcon={<Iconify icon="solar:pen-bold" />}
            onClick={onEdit}
            disabled={isEditDisabled}
          />
        </Stack>
      </Stack>

      {/* Actions Popover */}
      <CustomPopover
        open={actionPopover.open}
        onClose={actionPopover.onClose}
        anchorEl={actionPopover.anchorEl}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          {getActions().map((action) => (
            <MenuItem
              key={action.label}
              disabled={action.disabled}
              onClick={() => {
                actionPopover.onClose();
                action.action();
              }}
            >
              <Iconify icon={action.icon} />
              {action.label}
            </MenuItem>
          ))}
        </MenuList>
      </CustomPopover>

      {/* View Popover */}
      <CustomPopover
        open={viewPopover.open}
        onClose={viewPopover.onClose}
        anchorEl={viewPopover.anchorEl}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              viewPopover.onClose();
              viewLR.onTrue();
            }}
            disabled={subtrip.subtripStatus === SUBTRIP_STATUS.IN_QUEUE}
          >
            <Iconify icon="mdi:file-document-outline" />
            Lorry Receipt (LR)
          </MenuItem>
          {hasDieselIntent && (
            <MenuItem
              onClick={() => {
                viewPopover.onClose();
                viewIntent.onTrue();
              }}
              disabled={subtrip.subtripStatus === SUBTRIP_STATUS.IN_QUEUE}
            >
              <Iconify icon="mdi:file-document-outline" />
              Petrol Pump Intent
            </MenuItem>
          )}
          {hasEntryPass && (
            <MenuItem
              onClick={() => {
                viewPopover.onClose();
                viewEntryPass.onTrue();
              }}
            >
              <Iconify icon="mdi:file-document-outline" />
              Entry Pass
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              viewPopover.onClose();
              viewDriverPayment.onTrue();
            }}
            disabled={subtrip.subtripStatus === SUBTRIP_STATUS.IN_QUEUE}
          >
            <Iconify icon="mdi:file-document-outline" />
            Driver Payment
          </MenuItem>
          {hasTransporterPayment && (
            <MenuItem
              onClick={() => {
                viewPopover.onClose();
                viewTransporterPayment.onTrue();
              }}
              disabled={subtrip.subtripStatus === SUBTRIP_STATUS.IN_QUEUE}
            >
              <Iconify icon="mdi:file-document-outline" />
              Transporter Payment
            </MenuItem>
          )}
        </MenuList>
      </CustomPopover>

      {/* Download Popover */}
      <CustomPopover
        open={downloadPopover.open}
        onClose={downloadPopover.onClose}
        anchorEl={downloadPopover.anchorEl}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <PDFDownloadMenuItem
            document={<LRPDF subtrip={subtrip} tenant={tenant} />}
            fileName={`${subtrip.subtripNo}_lr`}
            label="Lorry Receipt (LR)"
            onClose={downloadPopover.onClose}
            disabled={subtrip.subtripStatus === SUBTRIP_STATUS.IN_QUEUE}
          />

          {hasDieselIntent && (
            <PDFDownloadMenuItem
              document={<IndentPdf subtrip={subtrip} tenant={tenant} />}
              fileName={`${subtrip.subtripNo}_indent`}
              label="Petrol Pump Indent"
              onClose={downloadPopover.onClose}
              disabled={subtrip.subtripStatus === SUBTRIP_STATUS.IN_QUEUE}
            />
          )}

          {hasEntryPass && (
            <PDFDownloadMenuItem
              document={<EntryPassPdf subtrip={subtrip} tenant={tenant} />}
              fileName={`${subtrip.subtripNo}_entry_pass`}
              label="Entry Pass"
              onClose={downloadPopover.onClose}
            />
          )}

          <PDFDownloadMenuItem
            document={<DriverPaymentPdf subtrip={subtrip} tenant={tenant} />}
            fileName={`${subtrip.subtripNo}_driver_payment`}
            label="Driver Payment"
            onClose={downloadPopover.onClose}
            disabled={subtrip.subtripStatus === SUBTRIP_STATUS.IN_QUEUE}
          />

          {hasTransporterPayment && (
            <PDFDownloadMenuItem
              document={<TransporterPayment subtrip={subtrip} tenant={tenant} />}
              fileName={`${subtrip.subtripNo}_transporter_payment`}
              label="Transporter Payment"
              onClose={downloadPopover.onClose}
              disabled={subtrip.subtripStatus === SUBTRIP_STATUS.IN_QUEUE}
            />
          )}
        </MenuList>
      </CustomPopover>

      {/* PDF Viewers */}
      <PDFViewerDialog open={viewLR.value} onClose={viewLR.onFalse}>
        <LRPDF subtrip={subtrip} tenant={tenant} />
      </PDFViewerDialog>

      <PDFViewerDialog open={viewIntent.value} onClose={viewIntent.onFalse}>
        <IndentPdf subtrip={subtrip} tenant={tenant} />
      </PDFViewerDialog>

      <PDFViewerDialog open={viewEntryPass.value} onClose={viewEntryPass.onFalse}>
        <EntryPassPdf subtrip={subtrip} tenant={tenant} />
      </PDFViewerDialog>

      <PDFViewerDialog open={viewDriverPayment.value} onClose={viewDriverPayment.onFalse}>
        <DriverPaymentPdf subtrip={subtrip} tenant={tenant} />
      </PDFViewerDialog>

      <PDFViewerDialog open={viewTransporterPayment.value} onClose={viewTransporterPayment.onFalse}>
        <TransporterPayment subtrip={subtrip} tenant={tenant} />
      </PDFViewerDialog>
    </>
  );
}
