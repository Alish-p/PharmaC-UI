import { toast } from 'sonner';
import React, { useMemo, useState, useCallback } from 'react';

import { Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { ICONS } from 'src/assets/data/icons';
import {
  useSellTyre,
  useMountTyre,
  useScrapTyre,
  useUpdateTyre,
  useUnmountTyre,
} from 'src/query/use-tyre';

import { GenericTableRow } from 'src/components/table';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { TYRE_STATUS } from './tyre-constants';
import { TYRE_TABLE_COLUMNS } from './tyre-table-config';
import TyreSellDialog from './components/tyre-sell-dialog';
import TyreMountWizard from './components/tyre-mount-wizard';
import TyreScrapDialog from './components/tyre-scrap-dialog';
import TyreRemoldDialog from './components/tyre-remold-dialog';
import TyreUnmountDialog from './components/tyre-unmount-dialog';
import TyreThreadUpdateDialog from './components/tyre-thread-update-dialog';
import TyreOdometerUpdateDialog from './components/tyre-odometer-update-dialog';

// ----------------------------------------------------------------------

export default function TyreTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
  visibleColumns,
  disabledColumns,
  columnOrder,
}) {
  const [openThreadDialog, setOpenThreadDialog] = useState(false);
  const [openMountWizard, setOpenMountWizard] = useState(false);
  const [openUnmountDialog, setOpenUnmountDialog] = useState(false);
  const [openScrapDialog, setOpenScrapDialog] = useState(false);
  const [openSellDialog, setOpenSellDialog] = useState(false);
  const [openRemoldDialog, setOpenRemoldDialog] = useState(false);
  const [openOdometerDialog, setOpenOdometerDialog] = useState(false);
  const rejectConfirm = useBoolean();

  const { mutateAsync: mountTyre } = useMountTyre();
  const { mutateAsync: unmountTyre } = useUnmountTyre();
  const { mutateAsync: scrapTyre } = useScrapTyre();
  const { mutateAsync: sellTyre } = useSellTyre();
  const { mutateAsync: updateTyre } = useUpdateTyre();

  const { status, type: tyreType } = row;

  // Flag rows where the mount odometer exceeds the vehicle's current odometer — physically impossible,
  // meaning the tyre was recorded as mounted at a higher km than the vehicle currently shows.
  const vehicleCurrentOdometer = row.currentVehicleId?.currentOdometer;
  const hasMountKmAnomaly =
    row.status === TYRE_STATUS.MOUNTED &&
    row.mountOdometer != null &&
    vehicleCurrentOdometer != null &&
    row.mountOdometer > vehicleCurrentOdometer;

  const handleMount = useCallback(
    async ({ vehicleId, position, odometer }) => {
      try {
        await mountTyre({
          id: row._id,
          data: { vehicleId, position, odometer, mountDate: new Date() },
        });
        toast.success('Tyre mounted successfully');
        setOpenMountWizard(false);
      } catch (e) {
        console.error(e);
        toast.error(e?.message || 'Failed to mount tyre');
      }
    },
    [mountTyre, row._id]
  );

  const handleUnmount = useCallback(
    async ({ odometer }) => {
      try {
        await unmountTyre({
          id: row._id,
          data: { odometer, unmountDate: new Date() },
        });
        toast.success('Tyre unmounted successfully');
        setOpenUnmountDialog(false);
      } catch (e) {
        console.error(e);
        toast.error(e?.message || 'Failed to unmount tyre');
      }
    },
    [unmountTyre, row._id]
  );

  const handleScrap = useCallback(
    async ({ odometer, scrapDate }) => {
      try {
        await scrapTyre({
          id: row._id,
          data: { odometer, scrapDate },
        });
        toast.success('Tyre moved to scrap successfully');
        setOpenScrapDialog(false);
      } catch (e) {
        console.error(e);
        toast.error(e?.message || 'Failed to scrap tyre');
      }
    },
    [scrapTyre, row._id]
  );

  const handleSell = useCallback(
    async ({ sellAmount, sellDate, transporterId, soldToTransporterName }) => {
      try {
        await sellTyre({
          id: row._id,
          data: { sellAmount, sellDate, transporterId, soldToTransporterName },
        });
        setOpenSellDialog(false);
      } catch (e) {
        console.error(e);
        toast.error(e?.message || 'Failed to sell tyre');
      }
    },
    [sellTyre, row._id]
  );

  const handleMarkAsRejected = useCallback(async () => {
    try {
      await updateTyre({ id: row._id, data: { type: 'Rejected' } });
      toast.success('Tyre marked as rejected successfully');
      rejectConfirm.onFalse();
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Failed to mark tyre as rejected');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateTyre, row._id]);

  const customActions = useMemo(() => {
    const actions = [];

    // Change Thread — enabled unless scrapped
    if (status !== TYRE_STATUS.SCRAPPED) {
      actions.push({
        label: 'Change Thread',
        icon: ICONS.tyre.measure,
        onClick: () => setOpenThreadDialog(true),
      });
    }

    // Mount — enabled when not mounted & not scrapped
    if (status !== TYRE_STATUS.MOUNTED && status !== TYRE_STATUS.SCRAPPED) {
      actions.push({
        label: 'Mount',
        icon: ICONS.tyre.tyre,
        onClick: () => setOpenMountWizard(true),
      });
    }

    // Unmount — only when mounted
    if (status === TYRE_STATUS.MOUNTED) {
      actions.push({
        label: 'Unmount',
        icon: ICONS.tyre.remove,
        onClick: () => setOpenUnmountDialog(true),
      });
    }

    // Update Odometer — only when mounted
    if (status === TYRE_STATUS.MOUNTED) {
      actions.push({
        label: 'Update Odometer',
        icon: ICONS.common.edit,
        onClick: () => setOpenOdometerDialog(true),
      });
    }

    // Move to Scrap — not scrapped & not sold
    if (status !== TYRE_STATUS.SCRAPPED && status !== TYRE_STATUS.SOLD) {
      actions.push({
        label: 'Move to Scrap',
        icon: ICONS.tyre.trashFilled,
        color: 'error.main',
        onClick: () => setOpenScrapDialog(true),
      });
    }

    // Sell — only when scrapped or in stock
    if (status === TYRE_STATUS.SCRAPPED || status === TYRE_STATUS.IN_STOCK) {
      actions.push({
        label: 'Sell',
        icon: ICONS.tyre.bill,
        color: 'success.main',
        onClick: () => setOpenSellDialog(true),
      });
    }

    // Mark as Rejected — not rejected & not scrapped & not sold
    if (tyreType !== 'Rejected' && status !== TYRE_STATUS.SCRAPPED && status !== TYRE_STATUS.SOLD) {
      actions.push({
        label: 'Mark as Rejected',
        icon: ICONS.common.close,
        color: 'error.main',
        onClick: () => rejectConfirm.onTrue(),
      });
    }

    // Remold — only when in stock
    if (status === TYRE_STATUS.IN_STOCK) {
      actions.push({
        label: 'Remold',
        icon: ICONS.tyre.remold,
        onClick: () => setOpenRemoldDialog(true),
      });
    }

    return actions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, tyreType, hasMountKmAnomaly]);

  const anomalyRowProps = hasMountKmAnomaly
    ? {
        sx: {
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255, 86, 48, 0.08)' : 'rgba(255, 86, 48, 0.06)',
          borderLeft: '3px solid',
          borderColor: 'error.main',
        },
      }
    : {};

  return (
    <>
      <GenericTableRow
        row={row}
        columns={TYRE_TABLE_COLUMNS}
        selected={selected}
        onSelectRow={onSelectRow}
        onViewRow={onViewRow}
        onEditRow={onEditRow}
        onDeleteRow={onDeleteRow}
        customActions={customActions}
        visibleColumns={visibleColumns}
        disabledColumns={disabledColumns}
        columnOrder={columnOrder}
        rowProps={anomalyRowProps}
      />

      {/* Change Thread Dialog */}
      <TyreThreadUpdateDialog
        open={openThreadDialog}
        onClose={() => setOpenThreadDialog(false)}
        tyreId={row._id}
        currentDepth={row?.threadDepth?.current}
        isMounted={status === TYRE_STATUS.MOUNTED}
      />

      {/* Mount Wizard */}
      <TyreMountWizard
        open={openMountWizard}
        onClose={() => setOpenMountWizard(false)}
        onMount={handleMount}
      />

      {/* Unmount Dialog */}
      {status === TYRE_STATUS.MOUNTED && (
        <TyreUnmountDialog
          open={openUnmountDialog}
          onClose={() => setOpenUnmountDialog(false)}
          onUnmount={handleUnmount}
          vehicleName={row.currentVehicleId?.vehicleNo}
        />
      )}

      {/* Scrap Dialog */}
      <TyreScrapDialog
        open={openScrapDialog}
        onClose={() => setOpenScrapDialog(false)}
        onScrap={handleScrap}
        currentStatus={status}
        vehicleNo={row.currentVehicleId?.vehicleNo}
      />

      {/* Sell Dialog */}
      {(status === TYRE_STATUS.SCRAPPED || status === TYRE_STATUS.IN_STOCK) && (
        <TyreSellDialog
          open={openSellDialog}
          onClose={() => setOpenSellDialog(false)}
          onSell={handleSell}
          tyreStatus={status}
          tyreCost={row.cost}
        />
      )}

      {/* Remold Dialog */}
      {status === TYRE_STATUS.IN_STOCK && (
        <TyreRemoldDialog
          open={openRemoldDialog}
          onClose={() => setOpenRemoldDialog(false)}
          tyreId={row._id}
          currentDepth={row?.threadDepth?.current}
        />
      )}

      {/* Odometer Update Dialog */}
      {status === TYRE_STATUS.MOUNTED && (
        <TyreOdometerUpdateDialog
          open={openOdometerDialog}
          onClose={() => setOpenOdometerDialog(false)}
          vehicleId={row.currentVehicleId?._id || row.currentVehicleId}
          vehicleNo={row.currentVehicleId?.vehicleNo}
        />
      )}

      {/* Reject Confirmation */}
      <ConfirmDialog
        open={rejectConfirm.value}
        onClose={rejectConfirm.onFalse}
        title="Mark as Rejected"
        content={`Are you sure you want to mark tyre "${row.serialNumber}" as rejected?`}
        action={
          <Button variant="contained" color="error" onClick={handleMarkAsRejected}>
            Mark as Rejected
          </Button>
        }
      />
    </>
  );
}
