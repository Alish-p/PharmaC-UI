import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers

/**
 * Given a subtrip, return which billing documents are already generated.
 * Returns an array of human-readable labels, e.g. ['Invoice', 'Driver Salary'].
 */
function getBlockingReasons(subtrip) {
  const reasons = [];
  if (subtrip.invoiceId) reasons.push('Invoice');
  if (subtrip.driverSalaryId) reasons.push('Driver Salary');
  if (subtrip.transporterPaymentReceiptId) reasons.push('Transporter Payment');
  return reasons;
}

// ─────────────────────────────────────────────────────────────────────────────

function JobRow({ subtrip, blocking = false }) {
  const blockingReasons = getBlockingReasons(subtrip);
  const expenseCount = subtrip.expenses?.length || 0;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 1.5,
        borderRadius: 1.5,
        bgcolor: blocking ? (theme) => alpha(theme.palette.error.main, 0.04) : 'background.paper',
        border: '1px dashed',
        borderColor: blocking ? 'error.main' : 'divider',
        transition: 'all 0.3s',
        '&:hover': {
          boxShadow: (theme) => theme.customShadows.z8,
          borderColor: blocking ? 'error.main' : 'text.disabled',
        },
      }}
    >
      <Box
        sx={{
          mr: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          height: 48,
          borderRadius: '50%',
          bgcolor: blocking
            ? (theme) => alpha(theme.palette.error.main, 0.16)
            : 'background.neutral',
          color: blocking ? 'error.main' : 'text.secondary',
        }}
      >
        <Iconify
          icon={blocking ? 'solar:danger-triangle-bold' : 'solar:box-minimalistic-bold'}
          width={24}
        />
      </Box>

      <Stack spacing={0.5} sx={{ flexGrow: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle2" noWrap>
            {subtrip.subtripNo || '—'}
          </Typography>
          <Label
            variant="soft"
            color={
              subtrip.subtripStatus === 'billed'
                ? 'success'
                : subtrip.subtripStatus === 'received'
                  ? 'info'
                  : 'warning'
            }
            sx={{ height: 20, fontSize: 10 }}
          >
            {subtrip.subtripStatus || '—'}
          </Label>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ typography: 'caption', color: 'text.secondary' }}
        >
          <Iconify icon="solar:route-bold" width={14} />
          <Typography variant="caption" noWrap>
            {subtrip.loadingPoint || '?'} → {subtrip.unloadingPoint || '?'}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ typography: 'caption', color: 'text.disabled' }}
        >
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Iconify icon="solar:user-bold" width={14} />
            <Typography variant="caption" noWrap maxWidth={100}>
              {subtrip.driverId?.driverName || '—'}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Iconify icon="solar:users-group-rounded-bold" width={14} />
            <Typography variant="caption" noWrap maxWidth={100}>
              {subtrip.customerId?.customerName || '—'}
            </Typography>
          </Stack>
          {expenseCount > 0 && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify icon="solar:wallet-bold" width={14} />
              <Typography variant="caption" noWrap>
                {expenseCount} exp
              </Typography>
            </Stack>
          )}
        </Stack>
      </Stack>

      {/* Blocking reasons OR delete indicator */}
      <Stack spacing={0.5} alignItems="flex-end" sx={{ ml: 2 }}>
        {blocking ? (
          blockingReasons.map((r) => (
            <Chip
              key={r}
              label={r}
              size="small"
              color="error"
              variant="soft"
              sx={{ height: 20, fontSize: 10, fontWeight: 600 }}
            />
          ))
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
              color: 'error.main',
            }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" width={16} />
          </Box>
        )}
      </Stack>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function TripDeleteDialog({ trip, open, onClose, onConfirm, isDeleting }) {
  const theme = useTheme();

  if (!trip) return null;

  const subtripsArr = Array.isArray(trip.subtrips) ? trip.subtrips : [];

  // Partition jobs
  const blockingJobs = subtripsArr.filter((st) => getBlockingReasons(st).length > 0);
  const deletableJobs = subtripsArr.filter((st) => getBlockingReasons(st).length === 0);

  const canDelete = blockingJobs.length === 0;

  const totalExpenses = subtripsArr.reduce((sum, st) => sum + (st.expenses?.length || 0), 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ pb: 3, pt: 3, px: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2.5}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: canDelete
                ? alpha(theme.palette.error.main, 0.1)
                : alpha(theme.palette.warning.main, 0.1),
              color: canDelete ? 'error.main' : 'warning.main',
            }}
          >
            <Iconify
              icon={canDelete ? 'solar:trash-bin-trash-bold' : 'solar:shield-warning-bold'}
              width={28}
            />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ mb: 0.5 }}>
              Delete Trip {trip.tripNo}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {fDate(trip.fromDate)} •{' '}
              <Typography component="span" variant="subtitle2" color="text.primary">
                {subtripsArr.length}
              </Typography>{' '}
              job{subtripsArr.length !== 1 ? 's' : ''} attached
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ px: 3, py: 3 }}>
        {/* ── Cannot delete ─────────────────────────────────────────── */}
        {!canDelete && (
          <Stack spacing={3}>
            <Alert
              severity="error"
              icon={<Iconify icon="solar:danger-bold" />}
              sx={{ borderRadius: 1.5 }}
            >
              This trip <strong>cannot be deleted</strong> because {blockingJobs.length} job
              {blockingJobs.length > 1 ? 's have' : ' has'} billing documents already generated.
              Please remove those documents first.
            </Alert>

            <Box>
              <Typography variant="subtitle2" color="error.main" sx={{ mb: 1.5 }}>
                Blocking Jobs ({blockingJobs.length})
              </Typography>
              <Stack spacing={1.5}>
                {blockingJobs.map((st) => (
                  <JobRow key={st._id} subtrip={st} blocking />
                ))}
              </Stack>
            </Box>

            {deletableJobs.length > 0 && (
              <Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Other Jobs (would have been deleted — {deletableJobs.length})
                </Typography>
                <Stack spacing={1.5}>
                  {deletableJobs.map((st) => (
                    <JobRow key={st._id} subtrip={st} />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        )}

        {/* ── Can delete ────────────────────────────────────────────── */}
        {canDelete && (
          <Stack spacing={3}>
            <Alert
              severity="warning"
              icon={<Iconify icon="solar:danger-triangle-bold" />}
              sx={{ borderRadius: 1.5 }}
            >
              This action is <strong>irreversible</strong>. The following items will be permanently
              removed from the system.
            </Alert>

            {/* Summary chips */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: 1.5,
                bgcolor: (t) => alpha(t.palette.error.main, 0.04),
                border: '1px solid',
                borderColor: (t) => alpha(t.palette.error.main, 0.1),
              }}
            >
              <Typography variant="subtitle2" color="error.main" sx={{ mb: 1.5 }}>
                Items to be deleted
              </Typography>
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                <Chip
                  icon={<Iconify icon="mdi:routes" width={16} />}
                  label="1 Trip Route"
                  size="small"
                  color="error"
                  variant="soft"
                  sx={{ fontWeight: 600 }}
                />
                {subtripsArr.length > 0 && (
                  <Chip
                    icon={<Iconify icon="ant-design:car-filled" width={16} />}
                    label={`${subtripsArr.length} Job${subtripsArr.length > 1 ? 's' : ''}`}
                    size="small"
                    color="error"
                    variant="soft"
                    sx={{ fontWeight: 600 }}
                  />
                )}
                {totalExpenses > 0 && (
                  <Chip
                    icon={<Iconify icon="ant-design:dollar-circle-filled" width={16} />}
                    label={`${totalExpenses} Expense${totalExpenses > 1 ? 's' : ''}`}
                    size="small"
                    color="error"
                    variant="soft"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Stack>
            </Box>

            {subtripsArr.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                  Jobs that will be deleted ({subtripsArr.length})
                </Typography>
                <Stack spacing={1.5}>
                  {subtripsArr.map((st) => (
                    <JobRow key={st._id} subtrip={st} />
                  ))}
                </Stack>
              </Box>
            )}

            {subtripsArr.length === 0 && (
              <Box
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderRadius: 1.5,
                  bgcolor: 'background.neutral',
                  border: '1px dashed',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  This trip has no jobs attached to it.
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2.5, bgcolor: 'background.neutral' }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          disabled={isDeleting}
          sx={{ fontWeight: 600 }}
        >
          Cancel
        </Button>

        {canDelete && (
          <Button
            variant="contained"
            color="error"
            startIcon={
              isDeleting ? (
                <Iconify icon="line-md:loading-loop" />
              ) : (
                <Iconify icon="solar:trash-bin-trash-bold" />
              )
            }
            onClick={onConfirm}
            disabled={isDeleting}
            sx={{ fontWeight: 600, boxShadow: theme.customShadows?.error }}
          >
            {isDeleting ? 'Deleting...' : 'Delete Trip'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
