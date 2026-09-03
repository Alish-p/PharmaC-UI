/* eslint-disable react/prop-types */

import { PDFViewer } from '@react-pdf/renderer';

// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Box, Dialog, Tooltip, MenuList, DialogActions } from '@mui/material';

import { RouterLink } from 'src/routes/components/router-link';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { useTenantContext } from 'src/auth/tenant';

import TripSheetPdf from '../pdfs/trip-sheet-pdf';
import { SUBTRIP_STATUS } from '../../subtrip/constants';

// ----------------------------------------------------------------------
export default function TripToolbar({ status, backLink, tripData, onTripClose, onEdit }) {
  const actionPopover = usePopover();
  const viewPopover = usePopover();
  const viewTripSheet = useBoolean();
  const tenant = useTenantContext();

  const isOwnVehicle = Boolean(tripData?.vehicleId?.isOwn);
  const subtrips = Array.isArray(tripData?.subtrips) ? tripData.subtrips : [];
  const allSubtripsBilled =
    subtrips.length > 0 && subtrips.every((st) => st?.subtripStatus === SUBTRIP_STATUS.BILLED);
  const canViewTripSheet = isOwnVehicle && allSubtripsBilled;

  const tripSheetTooltipTitle = !isOwnVehicle
    ? 'Trip Sheet is only available for Own vehicles'
    : !allSubtripsBilled
      ? 'Trip Sheet is visible only when all subtrips are billed'
      : '';

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
          <IconButton component={RouterLink} href={backLink}>
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButton>

          <Stack spacing={0.5}>
            <Stack spacing={1} direction="row" alignItems="center">
              <Typography variant="h4">Trip #{tripData.tripNo} </Typography>
              <Label
                variant="soft"
                color={
                  (status === 'open' && 'warning') ||
                  (status === 'closed' && 'success') ||
                  'default'
                }
              >
                {status}
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
          <Button
            color="primary"
            variant="outlined"
            endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
            onClick={actionPopover.onOpen}
            sx={{ textTransform: 'capitalize' }}
          >
            Actions
          </Button>

          <Button
            color="primary"
            variant="outlined"
            startIcon={<Iconify icon="solar:eye-bold" />}
            endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
            onClick={viewPopover.onOpen}
            sx={{ textTransform: 'capitalize' }}
          >
            View
          </Button>

          <Button
            color="primary"
            variant="outlined"
            startIcon={<Iconify icon="solar:pen-bold" />}
            onClick={onEdit}
          >
            Edit
          </Button>
        </Stack>
      </Stack>

      <CustomPopover
        open={actionPopover.open}
        onClose={actionPopover.onClose}
        anchorEl={actionPopover.anchorEl}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <span>
            <MenuItem
              onClick={() => {
                onTripClose();
                actionPopover.onClose();
              }}
            >
              Close Trip..
            </MenuItem>
          </span>
        </MenuList>
      </CustomPopover>

      <CustomPopover
        open={viewPopover.open}
        onClose={viewPopover.onClose}
        anchorEl={viewPopover.anchorEl}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <Tooltip
            title={tripSheetTooltipTitle}
            disableHoverListener={canViewTripSheet}
            disableFocusListener={canViewTripSheet}
            disableTouchListener={canViewTripSheet}
          >
            <span>
              <MenuItem
                onClick={() => {
                  viewPopover.onClose();
                  viewTripSheet.onTrue();
                }}
                disabled={!canViewTripSheet}
              >
                Trip Sheet
              </MenuItem>
            </span>
          </Tooltip>
        </MenuList>
      </CustomPopover>

      {/* View Trip Sheet Dialog */}
      <Dialog fullScreen open={viewTripSheet.value}>
        <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
          <DialogActions
            sx={{
              p: 1.5,
            }}
          >
            <Button color="primary" variant="outlined" onClick={viewTripSheet.onFalse}>
              Close
            </Button>
          </DialogActions>

          <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
            <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
              <TripSheetPdf trip={tripData} tenant={tenant} />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}
