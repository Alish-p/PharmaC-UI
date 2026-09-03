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

import { useOrphanDrivers, useCleanupDrivers } from 'src/query/use-driver';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';

export default function DriverCleanupDialog({ open, onClose }) {
  const { data, isLoading, error, refetch } = useOrphanDrivers({ enabled: open });
  const cleanupMutation = useCleanupDrivers();

  const [selectedIds, setSelectedIds] = useState([]);
  const confirmDialog = useBoolean();

  const orphanDrivers = data?.orphanDrivers || [];

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds(orphanDrivers.map((driver) => driver._id));
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
      await cleanupMutation.mutateAsync(selectedIds);
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

  const isAllSelected = orphanDrivers.length > 0 && selectedIds.length === orphanDrivers.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < orphanDrivers.length;

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="mdi:broom" width={24} />
          Driver Cleanup
          <Box sx={{ flex: 1 }} />
          <IconButton onClick={handleClose} size="small">
            <Iconify icon="mdi:close" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {isLoading && <LinearProgress sx={{ mb: 2 }} />}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load orphan drivers: {error.message}
            </Alert>
          )}

          {!isLoading && !error && orphanDrivers.length === 0 && (
            <Alert severity="success" icon={<Iconify icon="mdi:check-circle" />}>
              No orphan drivers found. All drivers are associated with at least one subtrip, trip,
              salary record, or loan.
            </Alert>
          )}

          {!isLoading && orphanDrivers.length > 0 && (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Found {orphanDrivers.length} driver(s) not associated with any subtrip, trip, salary
                record, or loan. These drivers may have been created by mistake.
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
                    <TableCell>Driver Name</TableCell>
                    <TableCell>Phone Number</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orphanDrivers.map((driver) => (
                    <TableRow
                      key={driver._id}
                      hover
                      selected={selectedIds.includes(driver._id)}
                      onClick={() => handleSelectOne(driver._id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked={selectedIds.includes(driver._id)} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {driver.driverName}
                        </Typography>
                      </TableCell>
                      <TableCell>{driver.driverCellNo}</TableCell>
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
        content={`Are you sure you want to deactivate ${selectedIds.length} driver(s)? This action will soft-delete them by setting isActive to false.`}
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
