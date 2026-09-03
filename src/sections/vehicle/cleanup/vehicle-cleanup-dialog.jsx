import { useState } from 'react';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';

import { useBoolean } from 'src/hooks/use-boolean';

import { useOrphanVehicles, useCleanupVehicles } from 'src/query/use-vehicle';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';

export default function VehicleCleanupDialog({ open, onClose }) {
  const { data, isLoading, error, refetch } = useOrphanVehicles({ enabled: open });
  const cleanupMutation = useCleanupVehicles();

  const [selectedIds, setSelectedIds] = useState([]);
  const confirmDialog = useBoolean();

  const orphanVehicles = data?.orphanVehicles || [];

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds(orphanVehicles.map((vehicle) => vehicle._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const handleCleanup = async () => {
    try {
      await cleanupMutation.mutateAsync({ vehicleIds: selectedIds });
      setSelectedIds([]);
      confirmDialog.onFalse();
      refetch();
    } catch (err) {
      // Error handled in mutation hook
    }
  };

  const handleClose = () => {
    setSelectedIds([]);
    onClose();
  };

  const isAllSelected = orphanVehicles.length > 0 && selectedIds.length === orphanVehicles.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < orphanVehicles.length;

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="mdi:broom" width={24} />
          Vehicle Cleanup
          <Box sx={{ flex: 1 }} />
          <IconButton onClick={handleClose} size="small">
            <Iconify icon="mdi:close" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {isLoading && <LinearProgress sx={{ mb: 2 }} />}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load orphan vehicles: {error.message}
            </Alert>
          )}

          {!isLoading && !error && orphanVehicles.length === 0 && (
            <Alert severity="success" icon={<Iconify icon="mdi:check-circle" />}>
              No orphan vehicles found. All vehicles are associated with at least one record (trip,
              subtrip, expense, tyre, or document).
            </Alert>
          )}

          {!isLoading && orphanVehicles.length > 0 && (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Found {orphanVehicles.length} vehicle(s) not associated with any record. These
                vehicles may have been created by mistake.
              </Alert>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isAllSelected}
                        indeterminate={isIndeterminate}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Vehicle No</TableCell>
                    <TableCell>Vehicle Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orphanVehicles.map((vehicle) => (
                    <TableRow
                      key={vehicle._id}
                      hover
                      selected={selectedIds.includes(vehicle._id)}
                      onClick={() => handleSelectOne(vehicle._id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked={selectedIds.includes(vehicle._id)} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {vehicle.vehicleNo}
                        </Typography>
                      </TableCell>
                      <TableCell>{vehicle.vehicleType}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Close
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={selectedIds.length === 0 || cleanupMutation.isLoading}
            startIcon={<Iconify icon="mdi:delete-sweep" />}
            onClick={confirmDialog.onTrue}
          >
            Clean Selected ({selectedIds.length})
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDialog.value}
        onClose={confirmDialog.onFalse}
        title="Confirm Cleanup"
        content={`Are you sure you want to deactivate ${selectedIds.length} vehicle(s)? This action will soft-delete them by setting isActive to false.`}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleCleanup}
            disabled={cleanupMutation.isLoading}
          >
            {cleanupMutation.isLoading ? 'Cleaning...' : 'Confirm Cleanup'}
          </Button>
        }
      />
    </>
  );
}
